import { isValidElement, VNode } from 'preact'
import isFalsy from '~/utils/is-falsy'
import nodesToVNodes from '../nodes-to-vnodes'

export function toBoolean (value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase().trim() === 'true') return true
    return false
  }
  return !isFalsy(value)
}

export function toNumber (value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value)
  return 0
}

export function toString (value: unknown) {
  if (typeof value === 'string') return value
  return String(value)
}

export function toNull (_value: unknown) {
  return null
}

export function toArray (value: unknown) {
  if (Array.isArray(value)) return value
  if (typeof value === 'object' && value !== null) return Object
    .entries(value)
    .map((key, value) => ({ key, value }))
  return [value]
}

export function toVNode (value: unknown): VNode {
  if (typeof value === 'string') return <>{value}</>
  else if (value instanceof HTMLElement) return nodesToVNodes(value)[0]
  else if (isValidElement(value)) return value
  else if (Array.isArray(value)) {
    const vnodesArr = value.map(item => toVNode(item))
    return <>{...vnodesArr}</>
  }
  else return <></>
}
