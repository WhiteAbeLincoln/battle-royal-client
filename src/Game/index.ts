import { getState } from './Game'
import { getArea, convert, render } from './Render'
import { Observable } from 'rxjs/Observable'
import fscreen from 'fscreen'
import { filter } from 'rxjs/operators'

/**
 * Starts a game and returns an observable which emits when the menu key is hit
 */
export const game = (canvas: HTMLCanvasElement,
                     socket: SocketIOClient.Socket,
                     menuOpen$: Observable<boolean>) => () => {
  const { state$
        , uiInput$
        , inputSequence$
        , pickSpawn$
        , user$
        , camera$
        } = getState(socket, canvas, menuOpen$)

  // tslint:disable:no-expression-statement

  pickSpawn$.subscribe(({ x, y }) => {
    socket.emit('set_spawn', { x, y })
  })

  uiInput$.subscribe(f => {
    // tslint:disable:no-if-statement
    // tslint:disable:no-object-mutation
    if (f === 'Fullscreen') {
      if (!fscreen.fullscreenElement) {
        fscreen.requestFullscreen(canvas)
        setTimeout(() => {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
        }, 50)
      } else {
        fscreen.exitFullscreen()
      }
    }
    // tslint:enable:no-if-statement
    // tslint:enable:no-object-mutation
  })

  inputSequence$.subscribe(v => {
    socket.emit('user_action', v)
  })

  user$.subscribe(u => console.log(u))

  state$.subscribe(render(canvas))

  camera$.subscribe(c => console.log(c))

  return filter((i): i is 'Menu' => i === 'Menu')(uiInput$)
}
