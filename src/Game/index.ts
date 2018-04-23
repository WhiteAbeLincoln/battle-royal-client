import { getState } from './Game'
import { getArea, convert, render } from './Render'
import { Observable } from 'rxjs/Observable'
import fscreen from 'fscreen'

/**
 * Starts a game and returns an observable which emits when the menu key is hit
 */
export const game = (canvas: HTMLCanvasElement,
                     socket: SocketIOClient.Socket,
                     menuOpen$: Observable<boolean>) => () => {
  const { map$
        , state$
        , start$
        , input$
        , uiInput$
        , gameInput$
        , pickSpawn$
        , user$
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

  // tslint:disable:no-let
  let seq = 0

  gameInput$.subscribe(v => {
    socket.emit('user_action', { action: v, seq })
    seq++
  })

  user$.subscribe(u => console.log(u))

  state$.subscribe(render(canvas))

  return uiInput$.filter((i): i is 'Menu' => i === 'Menu')
}
