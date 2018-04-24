import { WorldObject } from './World'
import { WorldMap } from './Map'
import { User } from './User'
import { Projectile } from './Weapon'
import { Camera } from './Camera'

export type Vec2 = {
  readonly x: number,
  readonly y: number
}

export interface Dimension {
  readonly width: number
  readonly height: number
}
export type Area = Vec2 & Dimension

export type Movable = {
  position: Vec2
  direction: Vec2
  velocity?: Vec2
}

/*
Ways to reason about our state over time:
1. The state is an object which gets modified at points in time
2. The state is a stream of actions that modify an existing state and return a new state
3. State is a set of properties objects which react to actions over time, producing a new state with a changed property.
   These streams are merged to get the final state stream
4. State is a set of property streams. Each property is its own observable which subscribes to action streams
*/

export type State = {
  readonly map: WorldMap,
  readonly spawns: ReadonlyArray<Vec2>,
  readonly elapsedTime: number,
  readonly started: boolean,
  readonly player: User
  readonly opponents: ReadonlyArray<User>
  readonly projectiles: ReadonlyArray<Projectile>
  readonly camera: Camera
}
