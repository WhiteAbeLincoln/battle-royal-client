import { Area, Dimension, State } from './State'
import { WorldObject, render as worldRender } from './World'
import { render as renderUser } from './User'
import { withContext } from '../Canvas'
import { convertDimAreaPoint } from '../Render'

/*-----------------*
 *    RENDERING    *
 *-----------------*/

// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation

const renderBackground = (drawArea: Area) => (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'black'
  ctx.fillRect(drawArea.x, drawArea.y, drawArea.width, drawArea.height)
}

const renderObjects = (os: ReadonlyArray<WorldObject>) =>
                      (drawArea: Area) =>
                      (viewport: Dimension) =>
                      (ctx: CanvasRenderingContext2D) => {
  os.forEach(o => worldRender(o)(drawArea)(viewport)(ctx))
}

export const render = (state: State) =>
                      (drawArea: Area) =>
                      (viewport: Dimension) =>
                      (ctx: CanvasRenderingContext2D) => {
  renderBackground(drawArea)(ctx)
  const cv = convertDimAreaPoint(viewport)(drawArea)

  const center = cv({ x: state.player.position.x - viewport.width / 2
                    , y: state.player.position.y - viewport.height / 2 })

  withContext(c => {
    c.translate(center.x, center.y)
    renderUser(state.player)(drawArea)(viewport)(c)
  })(ctx)
}
