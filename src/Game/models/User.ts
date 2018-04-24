import { Vec2, Dimension, Area, Movable } from './State'
import { Ammunition, Weapon, fire, weaponKinds, Projectile } from './Weapon'
import { Map } from 'immutable'
import { GameInput } from '../Actions'
import { Reducer } from '../Game'
import { rotateVec2, moveDirection, sub } from '../math'
import { withContext } from '../Canvas'
import { convertDimAreaPoint } from '../Render'
import { Camera } from './Camera'
import { WorldMap } from './Map'
import { Polygon } from '../Collision/SAT'

const ROTATE_ANGLE = Math.PI / 12
const MOVE_DIST = 0.5

type InventoryItem = Weapon

export interface Inventory {
  readonly kind: 'inventory'
  readonly ammunition: Map<Ammunition, number>
  readonly items: ReadonlyArray<InventoryItem>
  readonly equipped?: InventoryItem
}

const blankInventory = (): Inventory => ({
  kind: 'inventory'
, ammunition: Map()
, items: []
})

const hasAmmunition = (inventory: Inventory) => (w: Weapon) => {
  const ammo = inventory.ammunition.get(w.ammunition)
  return !!ammo
}

export const getEquippedItem = (user: User): InventoryItem | null => (
  user.inventory.equipped || null
)

export const isWeapon = (i: InventoryItem): i is Weapon => (
  weaponKinds.includes(i.kind)
)

export const removeAmmo = (i: Ammunition) => (inv: Inventory): Inventory => {
  const count = inv.ammunition.get(i, 0)
  const newCount = count - 1
  const ammunition = newCount > 0
    ? inv.ammunition.set(i, newCount)
    : inv.ammunition.delete(i)
  return { ...inv, ammunition }
}

export type User = {
  readonly kind: 'user'
  readonly spawnPoint: Vec2
  readonly health: number
  readonly inventory: Inventory
  readonly score: number
  readonly gamertag: string
} & Movable

export const blankUser = (): User => ({
  kind: 'user'
  , spawnPoint: { x: 0, y: 0 }
  , direction: { x: 1, y: 0 }
  , position: { x: 0, y: 0 }
  , health: 100
  , inventory: blankInventory()
  , score: 0
  , gamertag: ''
})

/**
 * Fires a users weapon, creating a projectile, and updates
 * ammunition count
 * @param user User firing weapon
 */
export const fireWeapon = (user: User): [Projectile | null, User] => {
  const equipped = getEquippedItem(user)

  const projectile = equipped
    && isWeapon(equipped)
    && fire(equipped)(user)

  const newUser: User = (projectile
    && { ...user, inventory: removeAmmo(projectile.kind)(user.inventory) })
    || user

  return [projectile || null, newUser]
}

const userPoly: Polygon = {
  kind: 'polygon',
  points: [
    { x: -0.5, y: 0.5 }
  , { x: 0, y: -0.5 }
  , { x: 0.5, y: 0.5 }
  ]
}

// TODO: make User an Immutable Map, because spread is costly
/**
 * Given a game input, returns a reducer function
 * which applies the input to a user object, returning a new user
 * @param input the Game input
 * @returns A user reducer function
 */
export const userReducer = (map: WorldMap) => (input: GameInput): Reducer<User> => {
  switch (input) {
    case 'TurnRight':
      return prev => {
        const oldDir = prev.direction
        const newDir = rotateVec2(ROTATE_ANGLE)(oldDir)

        return { ...prev, direction: newDir }
      }
    case 'TurnLeft':
      return prev => {
        const oldDir = prev.direction
        const newDir = rotateVec2(-ROTATE_ANGLE)(oldDir)

        return { ...prev, direction: newDir }
      }
    case 'Forward':
      return prev => {
        // move one meter in the current direction
        const newPoint = moveDirection(prev.direction)(prev.position)(MOVE_DIST)

        return { ...prev, position: newPoint }
      }
    case 'Back':
      return prev => {
        // move one meter in the current direction
        const newPoint = moveDirection(prev.direction)(prev.position)(-MOVE_DIST)

        return { ...prev, position: newPoint }
      }
    case 'Fire':
      return prev => fireWeapon(prev)[1]
  }
}

/*-----------------*
 *    RENDERING    *
 *-----------------*/

// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation

export const render = (user: User) =>
                      (drawArea: Area) =>
                      (viewport: Dimension) =>
                      (camera: Camera) =>
                      (ctx: CanvasRenderingContext2D) => {
  withContext(c => {
    const cv = convertDimAreaPoint(viewport)(drawArea)
    const camPos = camera.get('pos')

    // get coordinates of the object relative to the camera
    const relPos = cv(sub(user.position)(camPos))
    // user is rendered as a triangle inset on a 1-meter square
    const leftCorner = cv({ x: -0.5, y: 0.5 })
    const rightCorner = cv({ x: 0.5, y: 0.5 })
    const topCorner = cv({ x: 0, y: -0.5 })

    c.translate(relPos.x, relPos.y)
    c.rotate(Math.atan2(user.direction.y, user.direction.x))
    c.translate(-drawArea.x, -drawArea.y)

    c.fillStyle = 'red'
    c.beginPath()
    c.moveTo(leftCorner.x, leftCorner.y)
    c.lineTo(rightCorner.x, rightCorner.y)
    c.lineTo(topCorner.x, topCorner.y)
    c.fill()
  })(ctx)
}
