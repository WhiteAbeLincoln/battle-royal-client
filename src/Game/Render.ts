import { Rectangle } from './models/World'
import { State, Dimension, Area, Vec2 } from './models/State'
import * as WMap from './models/Map'

// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation

const lerp = (v0: number, v1: number, t: number) => (1 - t) * v0 + t * v1

export const convert = (srcMin: number,
                           srcMax: number) =>
                          (resMin: number,
                           resMax: number) =>
                             (src: number) => (src - srcMin)
                                         / (srcMax - srcMin)
                                         * (resMax - resMin)
                                         + resMin

const convertPoint = (smin: Vec2, smax: Vec2) => (dmin: Vec2, dmax: Vec2) => (point: Vec2) => {
  const x = convert(smin.x, smax.x)(dmin.x, dmax.x)(point.x)
  const y = convert(smin.y, smax.y)(dmin.y, dmax.y)(point.y)

  return { x, y }
}

export const convertDimAreaPoint = (dim: Dimension) => (area: Area) => (point: Vec2) => {
  const convertX = convert(0, dim.width)(0, area.width)
  const convertY = convert(0, dim.height)(0, area.height)

  const x = convertX(point.x) + area.x
  const y = convertY(point.y) + area.y

  return { x, y }
}

const fitArea = (src: Dimension, dest: Dimension, center = true) => {
  const ratioSrc = src.width / src.height
  const ratioDest = dest.width / dest.height

  return (ratioSrc > ratioDest)
    ? (point: Vec2) => {
      // we letterbox
      // when letterboxing, fit src.width to dest.width and flex src.height
        const width = convert(0, src.width)(0, dest.width)(point.x)
        const height = width * (1 / ratioSrc)
        return (!center)
          ? { x: 0, y: 0, width, height }
          : { x: 0, y: dest.height / 2 - height / 2, width, height }
      }
    : (point: Vec2) => {
      // we pillarbox
      // when pillarboxing, fit src.height to dest.height and flex src.width
        const height = convert(0, src.height)(0, dest.height)(point.y)
        const width = height * ratioSrc
        return (!center)
          ? { x: 0, y: 0, width, height }
          : { x: dest.width / 2 - width / 2, y: 0, width, height }
      }
}

export const getMapArea = (m: WMap.WorldMap, width: number, height: number) => {
  const srcMin = { x: 0, y: 0 }
  const srcMax = { x: m.width, y: m.height }
  const destMin = { x: 0, y: 0 }
  const dim = fitArea(m, { width, height })(srcMax)
  return dim
}

const renderSpawn = (spawn: Vec2) =>
                    (drawArea: Area) =>
                    (viewport: Dimension) =>
                    (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const { x, y } = convert(spawn)

  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.fill()
}

export const render = (canvas: HTMLCanvasElement) => (state: State) => {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // tslint:disable-next-line:no-if-statement
  if (!ctx) throw new Error('Couldn\'t get context')

  ctx.clearRect(0, 0, width, height)

  const render = (!state.started)
    ? [ WMap.render(state.map)(getMapArea(state.map, width, height))
      , ...state.spawns.map(s => renderSpawn(s)(getMapArea(state.map, width, height))(state.map))
      ]
    : []

  render.forEach(f => f(ctx))
}
