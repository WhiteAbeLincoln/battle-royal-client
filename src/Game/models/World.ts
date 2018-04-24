import { Area, Dimension, Vec2 } from './State'
import { convertDimAreaPoint } from '../Render'

type WorldObjectKind = 'rectangle' | 'polygon' | 'circle'

export interface WorldObjectBase {
  readonly color: string
  readonly kind: WorldObjectKind
}

export interface Rectangle extends WorldObjectBase {
  readonly kind: 'rectangle'
  readonly point1: Vec2
  readonly point2: Vec2
}

export interface Circle extends WorldObjectBase {
  readonly kind: 'circle'
  readonly center: Vec2
  readonly radius: number
}

export interface Polygon extends WorldObjectBase {
  readonly kind: 'polygon',
  readonly points: ReadonlyArray<Vec2>
}

export type WorldObject = Rectangle | Circle | Polygon

/*-----------------*
 *    RENDERING    *
 *-----------------*/

// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation

const renderRect = (rect: Rectangle) =>
                   (drawArea: Area) =>
                   (viewport: Dimension) =>
                   (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const { x: x1, y: y1 } = convert(rect.point1)
  const { x: x2, y: y2 } = convert(rect.point2)

  ctx.fillStyle = rect.color
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
}

const renderCirc = (circ: Circle) =>
                   (drawArea: Area) =>
                   (viewport: Dimension) =>
                   (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const { x, y } = convert(circ.center)
  // TODO: figure out how to convert with only one dimension
  const radius = convertDimAreaPoint(viewport)

  ctx.fillStyle = circ.color
  ctx.beginPath()
  ctx.arc(x, y, radius as any, 0, 2 * Math.PI)
}

const renderPoly = (poly: Polygon) =>
                   (drawArea: Area) =>
                   (viewport: Dimension) =>
                   (ctx: CanvasRenderingContext2D) => {
  throw new Error('Not Implemented')
}

export const render = (obj: WorldObject) => {
  switch (obj.kind) {
    case 'rectangle':
      return renderRect(obj)
    case 'polygon':
      return renderPoly(obj)
    case 'circle':
      return renderCirc(obj)
  }
}
