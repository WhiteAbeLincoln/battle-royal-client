import { Area, Vec2 } from '../models/State'

export type AABB = { readonly kind: 'AABB' } & Area
export type Circle = {
  readonly kind: 'Circle'
  readonly center: Vec2
  readonly radius: number
}

export const minkowskiDiffAABB = (a: AABB) => (b: AABB): AABB => ({
  kind: 'AABB'
  // m_left = a_left - b_right
  , x: a.x - (b.x + b.width)
  // m_top = a_top - b_bottom
  , y: a.y - (b.y + b.height)

  // m_width = a_width + b_width
  , width: a.width + b.width
  // m_height = a_height + b_height
  , height: a.height + b.height
})

const circleToAABB = (circle: Circle): AABB => {
  const radius = circle.radius
  const corner = { x: circle.center.x - radius, y: circle.center.y - radius }
  return {
    kind: 'AABB'
  , ...corner
  , width: radius * 2
  , height: radius * 2
  }
}
