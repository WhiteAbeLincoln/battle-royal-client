import { Polygon, colliding, linesOverlap, getSignedArea,
  getCentroid, centersDisplacement, projectShape, edgesOf } from './SAT'
import { add } from '../math'
import { Vec2 } from '../models/State'

// tslint:disable:no-expression-statement

describe('linesOverlap', () => {
  it('should handle non overlapping lines', () => {
    expect(linesOverlap({ min: 0, max: 3 }, { min: 4, max: 7 })).toBe(false)
  })

  it('should handle lines not in order', () => {
    expect(linesOverlap({ min: 3, max: 6 }, { min: 0, max: 2 })).toBe(false)
  })

  it('should handle touching lines', () => {
    expect(linesOverlap({ min: 0, max: 3 }, { min: 3, max: 6 })).toBe(false)
  })

  it('should handle overlapping lines', () => {
    expect(linesOverlap({ min: 0, max: 4 }, { min: 2, max: 6 })).toBe(true)
  })

  it('should handle contained lines', () => {
    expect(linesOverlap({ min: 0, max: 7 }, { min: 1, max: 4 })).toBe(true)
  })

  it('should handle the same line', () => {
    expect(linesOverlap({ min: 0, max: 2 }, { min: 0, max: 2 })).toBe(true)
  })
})

describe('getSignedArea', () => {
  it('should caclulate the area of a unit square', () => {
    const square: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0, y: 0 }
      , { x: 1, y: 0 }
      , { x: 1, y: 1 }
      , { x: 0, y: 1 }
      ]
    }

    expect(Math.abs(getSignedArea(square))).toBe(1)
  })

  it('should caculate the area of a triangle', () => {
    const triangle: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0, y: 0 }
      , { x: 0, y: 2 }
      , { x: 1, y: 0 }
      ]
    }

    expect(Math.abs(getSignedArea(triangle))).toBe(1)
  })
})

describe('getCentroid', () => {
  it('should caclulate the correct value for a square', () => {
    const square: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0, y: 0 }
      , { x: 40, y: 0 }
      , { x: 40, y: 40 }
      , { x: 0, y: 40 }
      ]
    }

    const square2: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 10, y: 0 }
      , { x: 50, y: 0 }
      , { x: 50, y: 40 }
      , { x: 10, y: 40 }
      ]
    }

    expect(getCentroid(square)).toEqual({ x: 20, y: 20 })
    expect(getCentroid(square2)).toEqual({ x: 30, y: 20 })
  })

  it('should calculate the correct value for a triangle', () => {
    const triangle: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0, y: 0 }
      , { x: 100, y: 0 }
      , { x: 50, y: 99 }
      ]
    }

    expect(getCentroid(triangle)).toEqual({ x: 50, y: 33 })
  })
})

describe('centersDisplacement', () => {
  it('should calculate the correct value for two squares', () => {
    const square1: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0, y: 0 }
      , { x: 40, y: 0 }
      , { x: 40, y: 40 }
      , { x: 0, y: 40 }
      ]
    }

    const square2: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 10, y: 0 }
      , { x: 50, y: 0 }
      , { x: 50, y: 40 }
      , { x: 10, y: 40 }
      ]
    }

    expect(centersDisplacement(square1, square2)).toEqual({ x: 10, y: 0 })
  })
})

describe('projectShape', () => {
  const square: Polygon = {
    kind: 'polygon'
  , points: [
      { x: 0, y: 0 }
    , { x: 1, y: 0 }
    , { x: 1, y: 1 }
    , { x: 0, y: 1 }
    ]
  }

  const triangle: Polygon = {
    kind: 'polygon'
  , points: [
      { x: 0, y: 0 }
    , { x: 0, y: 2 }
    , { x: 1, y: 0 }
    ]
  }

  const xAxis = { x: 1, y: 0 }
  const yAxis = { x: 0, y: 1 }

  it('should correctly project a square onto the x-axis and y-axis', () => {
    expect(projectShape(xAxis, square)).toEqual({ min: 0, max: 1 })
    expect(projectShape(yAxis, square)).toEqual({ min: 0, max: 1 })
  })

  it('should correctly project a triangle onto the x-axis and y-axis', () => {
    expect(projectShape(xAxis, triangle)).toEqual({ min: 0, max: 1 })
    expect(projectShape(yAxis, triangle)).toEqual({ min: 0, max: 2 })
  })
})

describe('edgesOf', () => {
  const square: Polygon = {
    kind: 'polygon'
  , points: [
      { x: 0, y: 0 }
    , { x: 1, y: 0 }
    , { x: 1, y: 1 }
    , { x: 0, y: 1 }
    ]
  }

  it('should get the edges of a square', () => {
    expect(edgesOf(square)).toEqual([
      { x: 1, y: 0 }
    , { x: 0, y: 1 }
    , { x: -1, y: 0 }
    , { x: 0, y: -1 }
    ])
  })
})

describe('SAT', () => {
  const square: Polygon = {
    kind: 'polygon'
  , points: [
      { x: 0, y: 0 }
    , { x: 1, y: 0 }
    , { x: 1, y: 1 }
    , { x: 0, y: 1 }
    ]
  }

  const triangle: Polygon = {
    kind: 'polygon'
  , points: [
      { x: 0, y: 0 }
    , { x: 0, y: 1 }
    , { x: 1, y: 0 }
    ]
  }

  it('should handle non-overlapping squares', () => {
    const rect2: Polygon = {
      kind: 'polygon'
    , points: square.points.map(v => ({ x: v.x + 2, y: v.y }))
    }

    expect(colliding(square)(rect2)).toBe(false)
  })

  it('should handle non-overlapping triangles', () => {
    const t2: Polygon = {
      kind: 'polygon'
    , points: triangle.points.map(v => ({ x: v.x + 2, y: v.y }))
    }

    expect(colliding(triangle)(t2)).toBe(false)
  })

  it('should handle the same shape', () => {
    expect(colliding(triangle)(triangle)).toBeTruthy()
    expect(colliding(square)(square)).toBeTruthy()
  })

  it('should give a correct minimum push vector for overlapping squares', () => {
    const overlap: Polygon = {
      kind: 'polygon'
    , points: [
        { x: 0.5, y: 0 }
      , { x: 1.5, y: 0 }
      , { x: 1.5, y: 1 }
      , { x: 0.5, y: 1 }
      ]
    }

    const push = colliding(square)(overlap)

    expect(push).toEqual({ x: 0.5, y: 0 })

    const newShape: Polygon = {
      kind: 'polygon'
    , points: overlap.points.map(add(push as any as Vec2))
    }

    expect(colliding(square)(newShape)).toBe(false)
  })

  it('should give a correct minimum push vector for overlapping triangles', () => {
    const overlap: Polygon = {
      kind: 'polygon'
    , points: triangle.points.map(v => ({ x: v.x + 0.5, y: v.y }))
    }

    expect(colliding(triangle)(overlap)).toEqual({ x: 0.5, y: 0 })
  })
})
