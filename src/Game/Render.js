// @flow
import type { State, Map, Rectangle, Pos } from './State'

let mapDim = { width: 0, height: 0 }
let canvasDim = { width: 0, height: 0 }

const lerp = (v0: number, v1: number, t: number) => (1 - t) * v0 + t * v1

export const convertDim = (src: number,
                        srcMin: number,
                        srcMax: number,
                        resMin: number,
                        resMax: number) => (src - srcMin)
                                         / (srcMax - srcMin)
                                         * (resMax - resMin)
                                         + resMin

const convertPoint = (smin: Pos, smax: Pos) => (dmin: Pos, dmax: Pos) => (point: Pos) => {
  const x = convertDim(point.x, smin.x, smax.x, dmin.x, dmax.x)
  const y = convertDim(point.y, smin.y, smax.x, dmin.y, dmax.y)

  return { x, y }
}

export const convertGame = (map: Pos) => convertPoint({ x: 0, y: 0 }, map)
// export const convertGameToCanvas = convertGame({ x: 0, y: 0 }, { x: canvasDim.width, y: canvasDim.height })
export const convertCanvas = convertPoint({ x: 0, y: 0 }, { x: canvasDim.width, y: canvasDim.height })
export const convertCanvasToGame = convertCanvas({ x: 0, y: 0 }, { x: mapDim.width, y: mapDim.height })

export const getMapArea = (m: Map, width: number, height: number) => {
  // const aspectRatio = m.width / m.height
  // for now assume our map is always square
  const min = Math.min(width, height)

  const { x, y } = convertPoint({x: 0, y: 0}, {x: m.width, y: m.height})({x: 0, y: 0}, {x: min, y: min})({x: m.width, y: m.height})
  return { width: x, height: y }
}

const drawRectangle = (r: Rectangle, width: number, height: number) =>
                      (ctx: CanvasRenderingContext2D) => {
  const convert = convertGame({ x: mapDim.width, y: mapDim.height })({ x: 0, y: 0 }, { x: width, y: height })
  const { x: x1, y: y1 } = convert(r.point1)
  const { x: x2, y: y2 } = convert(r.point2)
  console.log(`${x1}, ${y1} -- ${x2}, ${y2}`)

  ctx.fillStyle = r.color
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
}

const renderInitialMap = (m: Map, width: number, height: number) =>
                         (ctx: CanvasRenderingContext2D) => {
  // ctx.fillRect(x, y, w, h)
  const { width: x, height: y } = getMapArea(m, width, height)

  ctx.fillStyle = m.color
  ctx.fillRect(0, 0, x, y)

  for (const obj of m.objects) {
    switch (obj.kind) {
      case 'rectangle':
        drawRectangle(obj, x, y)(ctx)
        break
      default:
    }
  }
}

const renderSpawn = (p: *, m: Map, width: number, height: number) => (ctx: *) => {
  const { width: maxw, height: maxh } = getMapArea(m, width, height)

  const x = convertDim(p.x, 0, m.width, 0, maxw)
  const y = convertDim(p.y, 0, m.height, 0, maxh)
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.fill()
}

export const render = (canvas: HTMLCanvasElement) => (state: State) => {
  mapDim = { width: state.map.width, height: state.map.height }
  canvasDim = { width: canvas.width, height: canvas.height }

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '60px Arial'
  ctx.fillStyle = 'white'
  ctx.fillText(`${state.elapsedTime}`, 100, 100)
  let render = []

  render.push(renderInitialMap(state.map, canvas.width, canvas.height))
  const spawns = state.spawns.map(s => renderSpawn(s, state.map, canvas.width, canvas.height))
  render = [...render, ...spawns]

  render.forEach(f => f(ctx))
}
