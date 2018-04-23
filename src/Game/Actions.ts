import * as io from 'socket.io-client'
import { WorldMap } from './models/Map'
import { Vec2 } from './models/State'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/combineLatest'
import { filter } from 'rxjs/operators'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/of'
import { User } from './models/User'
import { SequenceItem } from './Game'
import { Projectile } from './models/Weapon'

const MessageKeys = { UPDATE_MAP: 'update_map'
                    , NEW_SPAWN: 'new_spawn'
                    , START_GAME: 'start_game'
                    , UPDATE: 'update_state'
                    }

// tslint:disable:no-expression-statement
function createSocketObs<T>(key: string): ((s: SocketIOClient.Socket) => Observable<T>) {
return (socket: SocketIOClient.Socket): Observable<T> =>
  new Observable(sub => {
    socket.on(key, (res: any) => {
      sub.next(res)
    })
  })
}

export const animation$ = new Observable<number>(sub => {
  // tslint:disable-next-line:no-let
  let stop = false

  const func = (time: number) => {
    sub.next(time)
    // tslint:disable-next-line:no-if-statement
    if (!stop) requestAnimationFrame(func)
  }

  func(performance.now())

  return () => { stop = true }
})
// tslint:enable:no-expression-statement

type StateUpdateData = User | ReadonlyArray<Projectile> | ReadonlyArray<User>

export const updateMap$ = createSocketObs<WorldMap>(MessageKeys.UPDATE_MAP)
export const newSpawn$ = createSocketObs<{ readonly [name: string]: Vec2 }>(MessageKeys.NEW_SPAWN)
export const startGame$ = createSocketObs<boolean>(MessageKeys.START_GAME)
export const updateState$ = createSocketObs<SequenceItem<StateUpdateData>>(MessageKeys.UPDATE)

export const filterPlayer = filter(
  (u: SequenceItem<StateUpdateData>): u is SequenceItem<User> =>
    !Array.isArray(u.data) && (u.data as Projectile | User).kind === 'user'
)

export const filterOpponents = filter(
  (u: SequenceItem<StateUpdateData>): u is SequenceItem<ReadonlyArray<User>> =>
    Array.isArray(u.data) && u.data[0] && (u.data[0] as Projectile | User).kind === 'user'
)

export const filterProjectiles = filter(
  (u: SequenceItem<StateUpdateData>): u is SequenceItem<ReadonlyArray<Projectile>> =>
    Array.isArray(u.data) && u.data[0] && (u.data[0] as Projectile | User).kind !== 'user'
)

export const keypress$ = (elem: HTMLElement) =>
  new Observable<ReadonlyArray<string>>(sub => {
    const map: Record<string, boolean> = {}

    const keydown = (e: KeyboardEvent) => {
      // tslint:disable-next-line:no-if-statement
      if (e.defaultPrevented) return
      // tslint:disable:no-expression-statement
      // tslint:disable:no-object-mutation
      map[e.key] = true
      const pressedKeys = Object.keys(map).filter(k => map[k])

      sub.next(pressedKeys)
    }

    const keyup = (e: KeyboardEvent) => {
      map[e.key] = false
    }

    elem.addEventListener('keydown', keydown, true)
    elem.addEventListener('keyup', keyup, true)

    return () => {
      elem.removeEventListener('keydown', keydown, true)
      elem.removeEventListener('keyup', keyup, true)
    }
    // tslint:enable:no-expression-statement
    // tslint:enable:no-object-mutation
  })

const isGameKey = (gameKeys: ReadonlyArray<string>) => (key: string) => {
  return gameKeys.includes(key)
}

export type GameInput =
          | 'TurnLeft'
          | 'TurnRight'
          | 'Forward'
          | 'Back'
          | 'Fire'

export type UIInput =
          | 'Fullscreen'
          | 'Menu'
          | 'Map'

export type Input = GameInput | UIInput

export type KeyMapping = {
  readonly [key: string]: Input
}

export const getKeyMappings = (): KeyMapping => {
  // we call this on every keypress. Maybe meomize?
  // or turn into observable
  const keys = localStorage.getItem('br-key_bindings')
  const defaultKeys: KeyMapping = {
    'a': 'TurnLeft'
  , 'ArrowLeft': 'TurnLeft'

  , 'd': 'TurnRight'
  , 'ArrowRight': 'TurnRight'

  , 'w': 'Forward'
  , 'ArrowUp': 'Forward'

  , 's': 'Back'
  , 'ArrowDown': 'Back'

  , ' ': 'Fire'

  , 'f': 'Fullscreen'
  , 'Escape': 'Menu'
  , 'm': 'Map'
  }

  try {
    return JSON.parse(keys || 'null') || defaultKeys
  } catch {
    return defaultKeys
  }
}

export const chatFocused$ = (element: HTMLInputElement) => {
  const chatEnter = Observable.fromEvent(element, 'focus')
                              .map(e => true)
  const chatLeave = Observable.fromEvent(element, 'blur')
                              .map(e => false)
  return chatEnter.merge(chatLeave).startWith(true)
}

export const input$ = (elem: HTMLElement) =>
  keypress$(elem)
    .map(keys => {
      const mappings = getKeyMappings()

      const gameKeys = keys.filter(isGameKey(Object.keys(mappings)))
      return gameKeys.map(k => mappings[k])
    })
    .filter(k => k.length > 0)
    .mergeMap(l => Observable.of(...l))

export const filterUIInput = filter((v: Input): v is UIInput => v === 'Menu' || v === 'Fullscreen' || v === 'Map')
export const filterGameInput = filter((v: Input): v is GameInput => v !== 'Menu' && v !== 'Fullscreen' && v !== 'Map')

export const click$ = (elem: HTMLElement) =>
    Observable.fromEvent<MouseEvent>(elem, 'click')

export const clickCoordinates$ = (canvas: HTMLCanvasElement) =>
                        click$(canvas).map(e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return { x, y }
})
