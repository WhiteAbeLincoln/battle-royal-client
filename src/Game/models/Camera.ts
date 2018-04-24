import { Area, Dimension, State, Vec2 } from './State'
import { WorldObject, render as worldRender } from './World'
import { render as renderUser } from './User'
import { withContext } from '../Canvas'
import { convertDimAreaPoint } from '../Render'
import { aabbContains } from '../Collision'
import { AABB } from '../Collision/minkowski'
import { Record } from 'immutable'

enum Axis {
  NONE = 'none',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  BOTH = 'both'
}

const ratio = 16 / 9
// Window has 16:9 ratio and is 15 meters wide
/**
 * A viewport in world units
 */
export const viewport = { width: 15, height: 15 * (1 / ratio) }

type CameraBase = {
  /** The position of the top left corner of the camera in world coordinates */
  pos: Vec2
  /** Viewport area */
  dim: Dimension
  /** Axis that the camera can move on */
  axis: Axis
  deadzone: Vec2
  /** position of the item that camera is following */
  follow?: Vec2
}

const cameraDefaults: CameraBase = {
  pos: { x: 0, y: 0 },
  dim: viewport,
  axis: Axis.BOTH,
  deadzone: { x: viewport.width / 2, y: viewport.height / 2 }
}

// tslint:disable-next-line:no-class
export class Camera extends Record(cameraDefaults) {
  constructor(params?: CameraBase) {
    // tslint:disable-next-line:no-expression-statement
    super(params as any)
  }

  get<T extends keyof CameraBase>(value: T): CameraBase[T] {
    return super.get(value)
  }
}

const canMoveHoriz = (c: Camera) => c.get('axis') === Axis.HORIZONTAL || Axis.BOTH
const canMoveVert = (c: Camera) => c.get('axis') === Axis.VERTICAL || Axis.BOTH

export const update = (world: Area) => (follow: Vec2) => (c: Camera): Camera => {
  const pos = c.get('pos')
  const dim = c.get('dim')
  const deadzone = c.get('deadzone')
  // recalculate horizontal pos based on follow position
  const xView = !canMoveHoriz(c)
    ? pos.x
    : (follow.x - pos.x + deadzone.x > dim.width)
        ? follow.x - (dim.width - deadzone.x)
        : follow.x - deadzone.x

  // recalculate vertical pos based on follow position
  const yView = !canMoveVert(c)
    ? pos.y
    : (follow.y - pos.x + deadzone.y > dim.height)
      ? follow.y - (dim.height - deadzone.y)
      : follow.y - deadzone.y

  const viewRect: AABB = {
    kind: 'AABB',
    x: xView,
    y: yView,
    width: dim.width,
    height: dim.height
  }

  // Make sure camera doesn't leave world boundry
  const contained = !aabbContains(world as AABB)(viewRect)

  const finalX =
    (viewRect.x < world.x)
      ? world.x
    : (viewRect.x + viewRect.width > world.x + world.width)
      ? (world.x + world.width) - dim.width
    : xView

  const finalY =
    (viewRect.y < world.y)
      ? world.y
    : (viewRect.y + viewRect.height > world.y + world.height)
      ? (world.y + world.height) - dim.height
    : yView

  return c.merge({ pos: { x: finalX, y: finalY }, follow })
}

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
                      (map: Dimension) =>
                      (viewport: Dimension) =>
                      (ctx: CanvasRenderingContext2D) => {
  renderBackground(drawArea)(ctx)
  const cv = convertDimAreaPoint(map)(drawArea)
  const viewportArea: Area = { x: state.player.position.x - map.width / 2
                             , y: state.player.position.y - map.height / 2
                             , ...map }

  // const drawnObjects = [state.player, ]

  // withContext(c => {
  //   c.translate(center.x, center.y)
  //   renderUser(state.player)(drawArea)(viewport)(c)
  // })(ctx)
}
