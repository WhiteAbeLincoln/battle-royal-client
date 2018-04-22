import { Vec2 } from './State'
import { User } from './User'

export interface ProjectileBase {
  readonly kind: string
  readonly name: string
  readonly direction: Vec2
  readonly position: Vec2
  readonly weapon: Weapon
  readonly user: string
}

export interface Bullet extends ProjectileBase {
  readonly kind: 'bullet'
  readonly name: 'Bullet'
}

export interface SniperBullet extends ProjectileBase {
  readonly kind: 'sniper_bullet'
  readonly name: 'Sniper Bullet'
}

export interface Rocket extends ProjectileBase {
  readonly kind: 'rocket'
  readonly name: 'Rocket'
}

export type Projectile = Bullet | SniperBullet | Rocket
export type Ammunition = Projectile['kind']

export interface WeaponBase {
  readonly kind: string
  readonly name: string
  readonly firerate: number
  readonly damage: number
  readonly speed: number
  readonly ammunition: Ammunition
}

export interface Gun extends WeaponBase {
  readonly kind: 'gun'
  readonly name: 'Gun'
  readonly firerate: 2
  readonly damage: 5
  // this is the minimum listed by wikipedia under muzzle velocity
  readonly speed: 120
  readonly ammunition: 'bullet'
}

export interface RocketLauncher extends WeaponBase {
  readonly kind: 'rocket_launcher'
  readonly name: 'Rocket Launcher'
  readonly firerate: 0.5
  readonly damage: 75
  // this is the minimum listed by wikipedia under muzzle velocity
  readonly speed: 10
  readonly ammunition: 'rocket'
}

export interface Sniper extends WeaponBase {
  readonly kind: 'sniper'
  readonly name: 'Sniper'
  readonly firerate: 0.75
  readonly damage: 45
  // this is the minimum listed by wikipedia under muzzle velocity
  readonly speed: 400
  readonly ammunition: 'sniper_bullet'
}

export type Weapon = Gun | RocketLauncher | Sniper

const projectile = (weapon: Weapon, user: User) => ({
    direction: { ...user.direction }
  , position: { ...user.position }
  , weapon
  , user: user.gamertag
})

const bullet = (weapon: Weapon) => (user: User): Bullet => ({
  ...projectile(weapon, user)
  , kind: 'bullet'
  , name: 'Bullet'
})

const sniperBullet = (weapon: Weapon) => (user: User): SniperBullet => ({
  ...projectile(weapon, user)
  , kind: 'sniper_bullet'
  , name: 'Sniper Bullet'
})

const rocket = (weapon: Weapon) => (user: User): Rocket => ({
  ...projectile(weapon, user)
  , kind: 'rocket'
  , name: 'Rocket'
})

export const fire = (weapon: Weapon) => {
  switch (weapon.kind) {
    case 'gun':
      return bullet(weapon)
    case 'rocket_launcher':
      return rocket(weapon)
    case 'sniper':
      return sniperBullet(weapon)
  }
}
