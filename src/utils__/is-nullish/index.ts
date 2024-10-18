export const nullishValues = [null, undefined]

export type Nullish = null | undefined

export function isNullish<T> (val: T | Nullish): val is Nullish {
  return nullishValues.includes(val as any)
}

export function isNotNullish<T> (val: T): val is Exclude<T, Nullish> {
  return !isNullish(val)
}

export default isNullish
