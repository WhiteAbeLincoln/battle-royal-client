import { getArea, convert } from './Render'
import { animation$, updateMap$, newSpawn$, startGame$, input$ as keyInput$,
  Input, chatFocused$, GameInput, UIInput, clickCoordinates$,
  updateState$, filterPlayer, filterUIInput, filterGameInput,
  filterOpponents, filterProjectiles } from './Actions'
import * as io from 'socket.io-client'
import { State, Vec2 } from './models/State'
import { Projectile } from './models/Weapon'
import fscreen from 'fscreen'
import { scan, filter, map } from 'rxjs/operators'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/observable/never'
import 'rxjs/add/observable/merge'
import { Observable } from 'rxjs/Observable'
import { blankUser, User, fireWeapon, userReducer } from './models/User'
import { rotateVec2, moveDirection } from './math'

/**
 * An observable for time elapsed between animation frames
 */
export const clock$ = animation$
                        .bufferCount(2, 1)
                        .map(([prev, current]) => current - prev)

export type Reducer<T> = (prev: T) => T
type ReducerStream<T> = Observable<Reducer<T>>
// tslint:disable-next-line:readonly-keyword
export type SequenceItem<T> = { seq: number, data: T }

const id = <T>(t: T) => t

// See
// https://journal.artfuldev.com/why-you-should-stop-using-state-reducers-in-your-app-to-be-fully-reactive-89a4279b3ece
/**
 * Produces an observable from an initial state and a reducer stream
 * @param reducer$ the reducer stream
 * @param initial the initial value
 */
export const reduce = <T>(initial: T) => (
  scan((current: T, reducer: Reducer<T>) => reducer(current), initial)
)

// tslint:disable-next-line:readonly-array
const sequence = <T>(...emitter: Array<Observable<T>>) => {
  const reducer$ =
    Observable.merge(
      ...emitter.map(em => em.map((e): Reducer<SequenceItem<T>> =>
        prev => ({ seq: prev.seq + 1, data: e })
      ))
    )

  return reduce({ seq: 0, data: null as any as T })(reducer$)
}

const bufferSequence = <T>(obs: Observable<T>) => {
  // tslint:disable:no-expression-statement
  // tslint:disable:no-if-statement
  const observable = sequence(obs)

  // Maybe implement this as a circular buffer instead?
  const buffer: Map<number, T> = new Map()

  observable.subscribe(d => buffer.set(d.seq, d.data))

  return {
    values: () => [...buffer.entries()].sort((a, b) => a[0] - b[0]).map(v => v[1])
  , obs: observable
  , clearTo: (seq: number) => {
      // would it be faster to sort by key
      // and then remove first n items?
      for (const key of buffer.keys()) {
        if (key <= seq) {
          buffer.delete(key)
        }
      }
    }
  }

  // tslint:enable:no-expression-statement
  // tslint:enable:no-if-statement
}

export const getState = (socket: SocketIOClient.Socket, canvas: HTMLCanvasElement, menuOpen$: Observable<boolean>) => {
  const gamertag: string = JSON.parse(localStorage.getItem('br-user')!).gamertag
  const map$ = updateMap$(socket)
  const start$ = startGame$(socket).startWith(false)
  const chat$ = chatFocused$(document.getElementById('chatBar') as HTMLInputElement)
  const input$ = keyInput$(window as any)
  const spawn$ = newSpawn$(socket)
  const update$ = updateState$(socket)
  const updateUser$ = filterPlayer(update$)
  const updateOpponents$ = filterOpponents(update$)
  const updateProjectiles$ = filterProjectiles(update$)

  const pickSpawn$ = clickCoordinates$(canvas)
    .combineLatest(map$, start$)
    .map(([pos, map, started]) => {
      const bounds = getArea(map, canvas.width, canvas.height)

      // tslint:disable-next-line:no-if-statement
      if (pos.x <= bounds.width + bounds.x
        && pos.x >= bounds.x
        && pos.y <= bounds.height + bounds.y
        && pos.y >= bounds.y
        && !started) {
        const x = convert(0, bounds.width)(0, map.width)(pos.x - bounds.x)
        const y = convert(0, bounds.height)(0, map.height)(pos.y - bounds.y)
        return { x, y }
      }
      return null
    }).filter((f): f is Vec2 => f !== null)

  type SpawnObj = { readonly [name: string]: Vec2 }

  const spawnsReducer$: ReducerStream<SpawnObj> =
    Observable.merge(
      pickSpawn$.map(s => (ss: SpawnObj) => ({
        ...ss, [gamertag]: s
      })),
      spawn$.map(s => (ss: SpawnObj) => ({ ...ss, ...s }))
    ).startWith(id)

  const spawns$ = spawnsReducer$.pipe(
    reduce({ [gamertag]: { x: 0, y: 0 } }),
    map(s => Object.keys(s).map(k => s[k]))
  )

  /**
   * A listener for input events that emits when the chat is not focused
   */
  const pauseInput$ = chat$.switchMap(chat => chat ? Observable.never<Input>() : input$)

  /**
   * A listener for ui input events that emits when the chat is not focused
   */
  const uiInput$ = filterUIInput(pauseInput$)

  /**
   * A listener for game input events that emits when the game is started,
   * the chat is not focused, and the menu is not open
   */
  const gameInput$ = start$.combineLatest(menuOpen$, chat$)
                           .switchMap(([started, menu, chat]) =>
                              started && !menu && !chat
                                ? input$
                                : Observable.never<Input>()
                           ).pipe(filterGameInput)

  const inputSequence = bufferSequence(gameInput$)

  const userReducer$: ReducerStream<User> =
    Observable.merge(
      spawn$.map(s => (prev: User) => {
        const tag = Object.keys(s)[0]
        const point = s[tag]
        return { ...prev, spawnPoint: point, position: point, gamertag: tag }
      }),
      gameInput$.map(userReducer),
      updateUser$.map(data => (_: User) => {
        // accept the server's authoritative state
        const newUser = data.data

        // clear the input buffer of all inputs before server's response
        // tslint:disable-next-line:no-expression-statement
        inputSequence.clearTo(data.seq)

        // apply all inputs that the server hasn't yet processed
        const reducers = inputSequence.values().map(userReducer)
        return reducers.reduce((user, f) => f(user), newUser)
      })
    ).startWith(id)

  const user$ = reduce(blankUser())(userReducer$)

  const projectileReducer$: ReducerStream<ReadonlyArray<Projectile>> =
    Observable.merge(
      gameInput$
        .filter((input: GameInput) => input === 'Fire')
        .withLatestFrom(user$)
        .map(([_, user]) => (p: ReadonlyArray<Projectile>) => {
          const newProj = fireWeapon(user)[0]
          return newProj ? [...p, newProj] : p
        }),
      // always accept the server's authoritative state
      updateProjectiles$.map(newProj => (_: any) => newProj.data)
    ).startWith(id)

  const projectiles$ = reduce([] as ReadonlyArray<Projectile>)(projectileReducer$)

  const ratio = 16 / 9
  // Window has 16:9 ratio and is 15 meters wide
  /**
   * A viewport in world units
   */
  const viewport = { width: 15, height: 15 * (1 / ratio) }

  const state$: Observable<State> =
    clock$.withLatestFrom(map$, spawns$, start$, user$, projectiles$,
            (elapsed, map, spawns, started, player, projectiles): State => ({
              elapsedTime: elapsed
            , spawns
            , map
            , started
            , viewport
            , player
            , opponents: []
            , projectiles
            }))

  return { map$
         , spawns$
         , state$
         , start$
         , input$: pauseInput$
         , gameInput$
         , uiInput$
         , pickSpawn$
         , user$
         }
}
