import * as math from 'mathjs'
import { Vec2 } from './models/State'

// tslint:disable:readonly-array

const clearSignedZero = (n: number) => (
  n === -0 || n === +0 ? 0 : n
)

export const rotationMatrix = (angle: number) => (
  math.matrix([ [math.cos(angle), -math.sin(angle)]
              , [math.sin(angle), math.cos(angle)]])
)

const convertVec2ToColumnVec = (vec: Vec2) => math.matrix([[vec.x], [vec.y]])
export const normalize = (vec: Vec2) => {
  const size = length(vec)
  return { x: vec.x / size, y: vec.y / size }
}

export const dot = (a: Vec2) => (b: Vec2) => a.x * b.x + a.y * b.y
export const length = (vec: Vec2) => math.sqrt(dot(vec)(vec))

/**
 * Project a vector onto another vector
 * @param a the vector to project
 * @param b the vector to project onto
 */
export const project = (a: Vec2) => (b: Vec2): Vec2 => {
  const amt = dot(a)(b) / dot(b)(b)
  return { x: amt * b.x, y: amt * b.y }
}

export const rotateVec2 = (angle: number) => (vec: Vec2): Vec2 => {
  const matrix = rotationMatrix(angle)
  const vector = convertVec2ToColumnVec(vec)
  const result = math.multiply(matrix, vector)
  const x = result.get([0, 0])
  const y = result.get([1, 0])
  const norm = normalize({ x, y })

  return norm
}

export const sub = (a: Vec2) => (b: Vec2): Vec2 => (
  { x: a.x - b.x, y: a.y - b.y }
)

export const add = (a: Vec2) => (b: Vec2): Vec2 => (
  { x: a.x + b.x, y: a.y + b.y }
)

export const mult = (c: number | math.Fraction) => (v: Vec2): Vec2 => {
  // tslint:disable-next-line:no-expression-statement
  math.config({ 'number': 'Fraction' })

  // tslint:disable-next-line:no-expression-statement no-parameter-reassignment
  c = typeof c === 'number' ? math.fraction(c) as any : c

  return {
    x: clearSignedZero(math.number(math.multiply(c as any, math.fraction(v.x))) as any as number)
  , y: clearSignedZero(math.number(math.multiply(c as any, math.fraction(v.y))) as any as number)
  }
}

/**
 * Returns the left rotation of the vector a,
 * which is a vector rotated 90 degrees counter-clockwise
 * @param a the vector to rotate
 */
export const leftRotate = (a: Vec2): Vec2 => ({
  x: -a.y, y: a.x
})

/**
 * Returns the right rotation of the vector a,
 * which is a vector rotated 90 degrees clockwise
 * @param a the vector to rotate
 */
export const rightRotate = (a: Vec2): Vec2 => ({
  x: a.y, y: -a.x
})

export const moveDirection = (direction: Vec2) => (start: Vec2) => (distance: number): Vec2 => {
  const dir = math.multiply([direction.x, direction.y], distance)
  const offset = [start.x, start.y]
  const result = math.add(dir, offset) as number[]
  const x = result[0]
  const y = result[1]

  return { x, y }
}
