// @flow

import { rgba } from 'polished'

export const IndigoPalette
  = { '500': '#3F51B5'
    , '50': '#E8EAF6'
    , '100': '#C5CAE9'
    , '200': '#9FA8DA'
    , '300': '#7986CB'
    , '400': '#5C6BC0'
    , '600': '#3949AB'
    , '700': '#303F9F'
    , '800': '#283593'
    , '900': '#1A237E'
    , A100: '#8C9EFF'
    , A200: '#536DFE'
    , A400: '#3D5AFE'
    , A700: '#304FFE'
    }

export const topShadow = (depth: number) => {
  const numbers = [1.5, 3, 10, 14, 19]
  const primaryOffset = numbers[depth] || numbers[0]
  const blur = (numbers[depth] || numbers[0]) * 2
  const color = rgba(0, 0, 0, [0.12, 0.16, 0.19, 0.25, 0.30][depth] || 0.12)
  return `0 ${primaryOffset}px ${blur}px ${color}`
}

export const bottomShadow = (depth: number) => {
  const numbers = [1.5, 3, 6, 10, 15]
  const primaryOffset = numbers[depth] || numbers[0]
  const blur = ([1, 3, 3, 5, 6][depth] || 1) * 2
  const color = rgba(0, 0, 0, [0.24, 0.23, 0.23, 0.22, 0.22][depth] || 0.24)
  return `0 ${primaryOffset}px ${blur}px ${color}`
}

export const shadow = (depth: number) => {
  if (depth > 5) return `${bottomShadow(0)}, ${topShadow(0)}`
  return `${bottomShadow(depth)}, ${topShadow(depth)}`
}
