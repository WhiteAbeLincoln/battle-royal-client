import { Vec2 } from './State'
import { Ammunition, Weapon, fire } from './Weapon'

type InventoryItem = Weapon

export interface Inventory {
  readonly kind: 'inventory'
  readonly ammunition: Map<Ammunition, number>
  readonly items: ReadonlyArray<InventoryItem>
  readonly equipped?: InventoryItem
}

const hasAmmunition = (inventory: Inventory) => (w: Weapon) => {
  const ammo = inventory.ammunition.get(w.ammunition)
  return !!ammo
}

export interface User {
  readonly kind: 'user'
  readonly spawnPoint: Vec2
  readonly direction: Vec2
  readonly position: Vec2
  readonly health: Vec2
  readonly inventory: Inventory
  readonly score: number
  readonly gamertag: string
}

/**
 * Fires a users weapon, creating a projectile, and updates
 * ammunition count
 * @param user User
 */
export const fireWeapon = (user: User) => {
  // FIXME: not a pure function - we mutate inventory
  const equipped = user.inventory.equipped
  const projectile = equipped
    && hasAmmunition(user.inventory)(equipped)
    && fire(equipped)(user)
  // tslint:disable-next-line:no-if-statement
  if (projectile) {
    const ammocount = user.inventory.ammunition.get(equipped!.ammunition)
    const map = ammocount && user.inventory.ammunition.set(equipped!.ammunition, ammocount - 1)
  }
  return projectile
}
