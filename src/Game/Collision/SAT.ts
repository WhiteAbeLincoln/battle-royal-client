import { Area, Vec2 } from '../models/State'
import { sub, leftRotate, dot, mult, normalize, length } from '../math'
import { map, takeWhile, pipe } from '../Iterable'
import { fraction, multiply, number } from 'mathjs'

export type Polygon = {
  readonly kind: 'polygon'
  readonly points: ReadonlyArray<Vec2>
}

function min(xs: number[]): number
function min<T>(xs: T[], comp: (a: T, b: T) => number): T
function min<T = number>(xs: T[], comp?: (a: T, b: T) => number) {
  const c = typeof comp === 'undefined' ? (a: number, b: number) => a - b : comp

  // tslint:disable-next-line:no-let
  let min = xs[0]

  for (const x of xs) {
    // tslint:disable-next-line:no-if-statement
    if ((c as any)(min, x) > 0) {
      // tslint:disable-next-line:no-expression-statement
      min = x
    }
  }

  return min
}

export const edgesOf = (p: Polygon) => (
  p.points.map((v, i, a) => sub(a[(i + 1) % a.length])(v))
)

export const colliding = (p1: Polygon) => (p2: Polygon) => {
  // we use a clockwise convention for points, so calculate the left normal
  const leftNormals = pipe(
    map(leftRotate),
    map(normalize)
  )

  // get the edges of our polygons
  const edges = [...edgesOf(p1), ...edgesOf(p2)]
  // get the axes to test on
  const axes = leftNormals(edges)

  const pipeline = pipe(
    // run SAT for every axis
    map((axis: Vec2) => separatingAxisTheorem(axis, p1, p2)),
    // stop caclulating once SAT returns null
    takeWhile((v): v is Vec2 => Boolean(v))
  )

  const pushVecs = [...pipeline(axes)]

  // if on any axis we don't get a push vector, then the polygons are not overlapping
  return pushVecs.length === edges.length
    ? (() => {
      const mpv = min(pushVecs, (a, b) => dot(a)(a) - dot(b)(b))
      const d = centersDisplacement(p1, p2)
      return dot(d)(mpv) < 0 ? mult(-1)(mpv) : mpv
    })() : false
}

export const projectShape = (axis: Vec2, p1: Polygon) => {
  const dots = p1.points.map(dot(axis))
  return { min: min(dots), max: Math.max(...dots) }
}

export const linesOverlap = (l1: ReturnType<typeof projectShape>, l2: ReturnType<typeof projectShape>) => {
  const { min1, max1, min2, max2 } =
    l1.min < l2.min
    ? { min1: l1.min, max1: l1.max, min2: l2.min, max2: l2.max }
    : { min1: l2.min, max1: l2.max, min2: l1.min, max2: l1.max }

  return (max1 > min2 && max2 > min1)
}

/**
 * Performs the separating axis theorem and calculates a
 * push vector if the shapes overlap along the provided axis
 * @param axis The axis to test along
 * @param p1 The first polygon to test
 * @param p2 The second polygon to test
 * @returns A push vector if polygons overlap on the axis
 */
const separatingAxisTheorem = (axis: Vec2, p1: Polygon, p2: Polygon): Vec2 | null => {
  const line1 = projectShape(axis, p1)
  const line2 = projectShape(axis, p2)

  return linesOverlap(line1, line2) ? (() => {
    const d = Math.min(line2.max - line1.min, line2.max - line2.min)
    const dOverAxis = fraction(d, dot(axis)(axis)) as math.Fraction
    return mult(dOverAxis)(axis)
  })() : null
}

export const getSignedArea = (p1: Polygon) => {
  const sum = p1.points.reduce((acc, point, i, a) => {
    const nextPoint = a[(i + 1) % a.length]
    return acc + point.x * nextPoint.y - nextPoint.x * point.y
  }, 0)

  return 0.5 * sum
}

export const getCentroid = (p1: Polygon): Vec2 => {
  const { cx, cy } = p1.points.reduce((acc, point, i, a) => {
    const nextPoint = p1.points[(i + 1) % p1.points.length]
    const part = (point.x * nextPoint.y - nextPoint.x * point.y)
    const cx = (point.x + nextPoint.x) * part
    const cy = (point.y + nextPoint.y) * part
    return { cx: acc.cx + cx, cy: acc.cy + cy }
  }, { cx: 0, cy: 0 })

  const A = getSignedArea(p1)
  const multiplier = fraction(1, (6 * A)) as math.Fraction
  return mult(multiplier)({ x: cx, y: cy })
}

/**
 * Gets displacement between the geometric center of p1 and p2
 * @param p1 the first polygon
 * @param p2 the second polygon
 */
export const centersDisplacement = (p1: Polygon, p2: Polygon) => {
  const c1 = getCentroid(p1)
  const c2 = getCentroid(p2)

  return sub(c2)(c1)
}
