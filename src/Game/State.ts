/*
Ways to reason about our state over time:
1. The state is an object which gets modified at points in time
2. The state is a stream of actions that modify an existing state and return a new state
3. State is a set of properties objects which react to actions over time, producing a new state with a changed property.
   These streams are merged to get the final state stream
4. State is a set of property streams. Each property is its own observable which subscribes to action streams
*/

export type Action = 'FIRE'
                   | 'ROTATE_LEFT'
                   | 'ROTATE_RIGHT'
                   | 'MOVE_FORWARD'
                   | 'MOVE_BACKWARD'

export type Vec2 = {
  x: number,
  y: number
}

export interface Rectangle {
  kind: 'rectangle',
  color: string,
  point1: Vec2,
  point2: Vec2
}

export interface Circle {
  kind: 'circle'
}

export interface Polygon {
  kind: 'polygon',
  color: string,
  edges: Vec2[]
}

export type Object = Polygon | Rectangle | Circle

export type Map = {
  width: number,
  height: number,
  color: string,
  objects: Object[]
}

export type Input = {
  key: string,
  action: Action
}

export type User = {
  controls: Input[];
}

export type State = {
  map: Map,
  spawns: Vec2[],
  elapsedTime: number,
  started: boolean,
  window: { width: number, height: number }
}
