// @flow
import type { Socket } from 'socket.io-client'
import type { Map, Pos } from './State'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/observable/fromEvent'

const MessageKeys = { UPDATE_MAP: 'update_map'
                    , NEW_SPAWN: 'new_spawn'
                    , START_GAME: 'start_game'
                    , COUNTDOWN: 'start_countdown' }

function createSocketObs(key: string) {
return (socket: Socket): rxjs$Observable<*> =>
  Observable.create(sub => {
    socket.on(key, res => {
      sub.next(res)
    })
  })
}

export const animation$ = Observable.create(sub => {
  let stop = false

  const func = (time) => {
    sub.next(time)
    if (!stop) requestAnimationFrame(func)
  }

  func(performance.now())

  return () => { stop = true }
})

export const updateMap$: Socket => rxjs$Observable<Map> = createSocketObs(MessageKeys.UPDATE_MAP)
export const newSpawn$: Socket => rxjs$Observable<{ [name: string]: Pos }> = createSocketObs(MessageKeys.NEW_SPAWN)
export const startGame$: Socket => rxjs$Observable<boolean> = createSocketObs(MessageKeys.START_GAME)
export const startCountdown$: Socket => rxjs$Observable<boolean> = createSocketObs(MessageKeys.COUNTDOWN)

export const keypress$ = (elem: HTMLElement) =>
  Observable.create(sub => {
    const map: * = {}

    const keydown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
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
  })

export const click$ = (elem: HTMLElement) =>
    Observable.fromEvent(elem, 'click')

export const clickCoordinates$ = (canvas: HTMLCanvasElement) =>
                        click$(canvas).map(e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return { x, y }
})
