import { Rectangle } from './models/World'
import { State, Dimension, Area, Vec2 } from './models/State'
import { render as renderViewport } from './models/Viewport'
import * as WMap from './models/Map'
import { User } from './models/User';

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
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.fill()
}
const renderPlayer = (player: User) =>
                    (drawArea: Area) =>
                    (viewport: Dimension) =>
                    (ctx: CanvasRenderingContext2D) => {
  const convert = convertDimAreaPoint(viewport)(drawArea)

  const { x, y } = convert(player.position)

  ctx.fillStyle = 'red'

  ctx.beginPath()
  // ctx.save()
  ctx.translate(x, y)
  ctx.rotate(Math.atan2(player.direction.y, player.direction.x))
  const leftCorner = ({ x: -5 , y:  5 })
  const rightCorner = ({ x: -5 , y:  - 5 })
  const topCorner = ({ x: 5, y: 0 })
  ctx.moveTo(leftCorner.x, leftCorner.y)
  ctx.lineTo(rightCorner.x, rightCorner.y)
  ctx.lineTo(topCorner.x, topCorner.y)
  ctx.rotate((-1) * Math.atan2(player.direction.y, player.direction.x))
  ctx.translate((-1) * x, (-1) * y)
  ctx.fill()
}
// thanks to sourceforge user dan-gph for this dummy proof howto

// function drawImageRot(img,x,y,width,height,deg){

//   //Convert degrees to radian 
//   var rad = deg * Math.PI / 180;

//   //Set the origin to the center of the image
//   ctx.translate(x + width / 2, y + height / 2);

//   //Rotate the canvas around the origin
//   ctx.rotate(rad);

//   //draw the image    
//   ctx.drawImage(img,width / 2 * (-1),height / 2 * (-1),width,height);

//   //reset the canvas  
//   ctx.rotate(rad * ( -1 ) );
//   ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
// }

export const render = (canvas: HTMLCanvasElement) => (state: State) => {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // tslint:disable-next-line:no-if-statement
  if (!ctx) throw new Error('Couldn\'t get context')

  ctx.clearRect(0, 0, width, height)

  const mapArea = getArea(state.map, width, height)
  const viewArea = getArea(state.viewport, width, height)

  const render = (!state.started)
    ? [ WMap.render(state.map)(mapArea)
      , ...state.spawns.map(s => renderSpawn(s)(mapArea)(state.map))
      ]
    : [ WMap.render(state.map)(mapArea),
      renderPlayer(state.player)(mapArea)(state.map)
      // attempt to render the opponents
      , ...state.opponents.map(s => renderPlayer(s)(mapArea)(state.map))
    ] // renderViewport(state)(viewArea)(viewArea) ]

  render.forEach(f => f(ctx))
}
