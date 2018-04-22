import { Area } from './State'
import { render as worldRender, WorldObject } from './World'

export type WorldMap = {
  readonly width: number,
  readonly height: number,
  readonly color: string,
  readonly objects: ReadonlyArray<WorldObject>
}

export const render = (map: WorldMap) =>
                      (drawArea: Area) =>
                      (ctx: CanvasRenderingContext2D) => {
  // tslint:disable:no-expression-statement
  // tslint:disable:no-object-mutation
  ctx.fillStyle = map.color
  ctx.fillRect(drawArea.x, drawArea.y, drawArea.width, drawArea.height)
  map.objects.forEach(o => worldRender(o)(drawArea)(map)(ctx))
}
