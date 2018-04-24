import { Rectangle } from './models/World'
import { State, Dimension, Area, Vec2 } from './models/State'
import * as WMap from './models/Map'
import { Camera, render as renderView } from './models/Camera'

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

export const getArea = (viewport: Dimension, width: number, height: number) => {
  const srcMax = { x: viewport.width, y: viewport.height }
  return fitArea(viewport, { width, height })(srcMax)
}

const renderSpawn = (spawn: Vec2) =>
                    (drawArea: Area) =>
                    (viewport: Dimension) =>
                    (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const { x, y } = convert(spawn)

  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(x, y, 1, 0, 2 * Math.PI)
  ctx.fill()
}

const renderCamera = (c: Camera) =>
                     (drawArea: Area) =>
                     (viewport: Dimension) =>
                     (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const pos = c.get('pos')
  const { x: x1, y: y1 } = convert({ x: pos.x, y: pos.y })
  const dim = c.get('dim')
  const { x: x2, y: y2 } = convert({ x: pos.x + dim.width, y: pos.y + dim.height })

  ctx.strokeStyle = 'blue'
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
}

const transparency = (alpha: number) => (ctx: CanvasRenderingContext2D) => {
  ctx.globalAlpha = alpha
}

export const render = (canvas: HTMLCanvasElement) => (state: State) => {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // tslint:disable-next-line:no-if-statement
  if (!ctx) throw new Error('Couldn\'t get context')

  ctx.clearRect(0, 0, width, height)

  const mapArea = getArea(state.map, width, height)
  const viewArea = getArea(state.camera.get('dim'), width, height)
  const vaRight = viewArea.x + viewArea.width
  const vaBottom = viewArea.y + viewArea.height
  const mapSize = 200
  const miniMapArea = { ...getArea(state.map, mapSize, mapSize), x: vaRight - mapSize, y: vaBottom - mapSize }

  const render = (!state.started)
    ? [ WMap.render(state.map)(mapArea)
      , ...state.spawns.map(s => renderSpawn(s)(mapArea)(state.map))
      ]
    : [ renderView(state)(viewArea)
      , transparency(0.5)
      , WMap.render(state.map)(miniMapArea)
      , renderSpawn(state.player.position)(miniMapArea)(state.map)
      , transparency(1)
      , renderCamera(state.camera)(miniMapArea)(state.map)
      ]

  render.forEach(f => f(ctx))
}
