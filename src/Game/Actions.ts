import * as io from 'socket.io-client'
import { Map, Vec2 } from './State'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/observable/fromEvent'

const MessageKeys = { UPDATE_MAP: 'update_map'
                    , NEW_SPAWN: 'new_spawn'
                    , START_GAME: 'start_game'
                    }

function createSocketObs<T>(key: string) {
return (socket: SocketIOClient.Socket): Observable<T> =>
  new Observable(sub => {
    socket.on(key, (res: any) => {
      sub.next(res)
    })
  })
}

export const animation$ = new Observable<number>(sub => {
  let stop = false

  const func = (time: number) => {
    sub.next(time)
    if (!stop) requestAnimationFrame(func)
  }

  func(performance.now())

  return () => { stop = true }
})

export const updateMap$ = createSocketObs<Map>(MessageKeys.UPDATE_MAP)
export const newSpawn$ = createSocketObs<{ [name: string]: Vec2 }>(MessageKeys.NEW_SPAWN)
export const startGame$ = createSocketObs<boolean>(MessageKeys.START_GAME)

export const keypress$ = (elem: HTMLElement) =>
  new Observable<string[]>(sub => {
    const map: Record<string, boolean> = {}

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
    Observable.fromEvent<MouseEvent>(elem, 'click')

export const clickCoordinates$ = (canvas: HTMLCanvasElement) =>
                        click$(canvas).map(e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return { x, y }
})
