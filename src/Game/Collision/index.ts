import { Vec2 } from '../models/State'
import { AABB } from './minkowski'

/**
 * Returns true if b contains a
 * @param b the containing Axis Aligned Bounding Box
 * @param a the other AABB
 */
export const aabbContains = (b: AABB) => (a: AABB) => {
  const aRight = a.x + a.width
  const aBottom = a.y + a.height

  const bRight = b.x + b.width
  const bBottom = b.y + b.height

  return (b.x <= a.x
    && bRight >= aRight
    && b.y <= a.y
    && bBottom >= aBottom)
}
