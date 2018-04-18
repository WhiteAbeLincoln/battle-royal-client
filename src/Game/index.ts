import { getState } from "./Game";
import { clickCoordinates$ } from "./Actions";
import { getMapArea, convertDim, render } from "./Render";

export class Game {
  constructor (private canvas: HTMLCanvasElement, private socket: SocketIOClient.Socket) { }

  start() {
      const { map$, state$ } = getState(this.socket, this.canvas)
      clickCoordinates$(this.canvas)
        .combineLatest(map$)
        .subscribe(([pos, map]) => {
          const bounds = getMapArea(map, this.canvas.width, this.canvas.height)

          if (pos.x <= bounds.width + bounds.x
            && pos.x >= bounds.x
            && pos.y <= bounds.height + bounds.y 
            && pos.y >= bounds.y) {
            const x = convertDim(0, bounds.width)(0, map.width)(pos.x - bounds.x)
            const y = convertDim(0, bounds.height)(0, map.height)(pos.y - bounds.y)
            this.socket && this.socket.emit('set_spawn', { x, y })
          }
        })

      state$.subscribe(render(this.canvas))
  }
}
