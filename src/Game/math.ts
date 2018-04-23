import * as math from 'mathjs'
import { Vec2 } from './models/State'

// tslint:disable:readonly-array

export const rotationMatrix = (angle: number) => (
  math.matrix([ [math.cos(angle), -math.sin(angle)]
              , [math.sin(angle), math.cos(angle)]])
)

const convertVec2ToColumnVec = (vec: Vec2) => math.matrix([[vec.x], [vec.y]])
const normalize = (vec: Vec2) => {
  const size = math.sqrt(vec.x ** 2 + vec.y ** 2)
  return { x: vec.x / size, y: vec.y / size }
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

export const moveDirection = (direction: Vec2) => (start: Vec2) => (distance: number): Vec2 => {
  const dir = math.multiply([direction.x, direction.y], distance)
  const offset = [start.x, start.y]
  const result = math.add(dir, offset) as number[]
  const x = result[0]
  const y = result[1]

  return { x, y }
}
