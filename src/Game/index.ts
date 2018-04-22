import { getState } from './Game'
import { clickCoordinates$ } from './Actions'
import { getMapArea, convert, render } from './Render'
import { Observable } from 'rxjs/Observable'
import fscreen from 'fscreen'

/**
 * Starts a game and returns an observable which emits when the menu key is hit
 */
export const game = (canvas: HTMLCanvasElement, socket: SocketIOClient.Socket, menuOpen$: Observable<boolean>) => () => {
  const { map$, state$, start$, input$, uiInput$, gameInput$ } = getState(socket, canvas, menuOpen$)
  // tslint:disable:no-expression-statement

  clickCoordinates$(canvas)
    .combineLatest(map$, start$)
    .subscribe(([pos, map, started]) => {
      const bounds = getMapArea(map, canvas.width, canvas.height)

      // tslint:disable-next-line:no-if-statement
      if (pos.x <= bounds.width + bounds.x
        && pos.x >= bounds.x
        && pos.y <= bounds.height + bounds.y
        && pos.y >= bounds.y
        && !started) {
        const x = convert(0, bounds.width)(0, map.width)(pos.x - bounds.x)
        const y = convert(0, bounds.height)(0, map.height)(pos.y - bounds.y)
        socket.emit('set_spawn', { x, y })
      }
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

  gameInput$.subscribe(v => socket.emit('user_action', v))

  state$.subscribe(render(canvas))

  return uiInput$.filter((i): i is 'Menu' => i === 'Menu')
}
