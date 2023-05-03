import isFalsy from '~/utils/is-falsy'

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

export function toNull (value: unknown) {
  return null
}
