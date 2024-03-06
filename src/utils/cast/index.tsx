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

export function toNumberArr (value: unknown) {
  const arrValue = toArray(value)
  return arrValue.map(val => toNumber(val))
}

export function toRecord (value: unknown) {
  const record: Record<string, unknown> = {}
  try {
    Object
      .keys(value as any)
      .forEach(key => { record[key] = (value as any)[key] })
  } catch (err) {
    return record
  }
  return record
}

export function toError (value: unknown) {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  return new Error(toString(value))
}
