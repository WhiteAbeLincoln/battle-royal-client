import { State, Map, Rectangle, Vec2 } from './State'

let mapDim = { width: 0, height: 0 }
let canvasDim = { width: 0, height: 0 }
interface Dimension {
  width: number;
  height: number
}
type Area = Vec2 & Dimension

const lerp = (v0: number, v1: number, t: number) => (1 - t) * v0 + t * v1

export const convertDim = (srcMin: number,
                           srcMax: number) =>
                          (resMin: number,
                           resMax: number) => 
                          (src: number)    => (src - srcMin)
                                         / (srcMax - srcMin)
                                         * (resMax - resMin)
                                         + resMin

const convertPoint = (smin: Vec2, smax: Vec2) => (dmin: Vec2, dmax: Vec2) => (point: Vec2) => {
  const x = convertDim(smin.x, smax.x)(dmin.x, dmax.x)(point.x)
  const y = convertDim(smin.y, smax.y)(dmin.y, dmax.y)(point.y)

  return { x, y }
}

const convertAreaGame = (map: Dimension) => (area: Area) => (point: Vec2) => {
  const convertX = convertDim(0, map.width)(0, area.width)
  const convertY = convertDim(0, map.height)(0, area.height)

  const x = convertX(point.x) + area.x
  const y = convertY(point.y) + area.y

  return { x, y }
}

export const convertGame = (map: Vec2) => convertPoint({ x: 0, y: 0 }, map)
// export const convertGameToCanvas = convertGame({ x: 0, y: 0 }, { x: canvasDim.width, y: canvasDim.height })
export const convertCanvas = convertPoint({ x: 0, y: 0 }, { x: canvasDim.width, y: canvasDim.height })
export const convertCanvasToGame = convertCanvas({ x: 0, y: 0 }, { x: mapDim.width, y: mapDim.height })

const fitArea = (src: Dimension, dest: Dimension, center = true) => {
  const ratioSrc = src.width / src.height
  const ratioDest = dest.width / dest.height

  if (ratioSrc > ratioDest) {
    // we letterbox
    // when letterboxing, fit src.width to dest.width and flex src.height
    return (point: Vec2) => {
      const width = convertDim(0, src.width)(0, dest.width)(point.x)
      const height = width * (1 / ratioSrc)
      if (!center) {
        return { x: 0, y: 0, width, height }
      }
      return { x: 0, y: dest.height / 2 - height / 2, width, height }
    }
  } else {
    // we pillarbox
    // when pillarboxing, fit src.height to dest.height and flex src.width
    return (point: Vec2) => {
      const height = convertDim(0, src.height)(0, dest.height)(point.y)
      const width = height * ratioSrc
      if (!center) {
        return { x: 0, y: 0, width, height }
      }

      return { x: dest.width / 2 - width / 2, y: 0, width, height }
    }
  }
}

export const getMapArea = (m: Map, width: number, height: number) => {
  const srcMin = {x: 0, y: 0}
  const srcMax = {x: m.width, y: m.height}
  const destMin = {x: 0, y: 0}
  const dim = fitArea(m, {width, height})(srcMax)
  // const { x, y } = convertPoint(srcMin, srcMax)(destMin, dim)({x: m.width, y: m.height})
  return dim
}

const drawRectangle = (r: Rectangle) =>
                      (area: Area) => (ctx: CanvasRenderingContext2D) => {
  // const convert = convertGame({ x: mapDim.width, y: mapDim.height })({ x: 0, y: area.y }, { x: area.width, y: area.height })

  const { x: x1, y: y1 } = convertAreaGame(mapDim)(area)(r.point1)
  const { x: x2, y: y2 } = convertAreaGame(mapDim)(area)(r.point2)

  ctx.fillStyle = r.color
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
}

const renderInitialMap = (m: Map, width: number, height: number) =>
                         (ctx: CanvasRenderingContext2D) => {
  // ctx.fillRect(x, y, w, h)
  const dim = getMapArea(m, width, height)

  ctx.fillStyle = m.color
  ctx.fillRect(dim.x, dim.y, dim.width, dim.height)

  for (const obj of m.objects) {
    switch (obj.kind) {
      case 'rectangle':
        drawRectangle(obj)(dim)(ctx)
        break
      default:
    }
  }
}

const renderSpawn = (p: Vec2, m: Map, width: number, height: number) => (ctx: CanvasRenderingContext2D) => {
  const area = getMapArea(m, width, height)

  const convertX = convertDim(0, m.width)(0, area.width)
  const convertY = convertDim(0, m.height)(0, area.height)

  const x = convertX(p.x) + area.x
  const y = convertX(p.y) + area.y

  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.fill()
}

export const render = (canvas: HTMLCanvasElement) => (state: State) => {
  mapDim = { width: state.map.width, height: state.map.height }
  canvasDim = { width: canvas.width, height: canvas.height }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  let render = []

  if (!state.started) {
    render.push(renderInitialMap(state.map, canvas.width, canvas.height))
    const spawns = state.spawns.map(s => renderSpawn(s, state.map, canvas.width, canvas.height))
    render.push(...spawns)
  } else {

  }

  render.forEach(f => f(ctx))
}
