import { nullishValues, Nullish } from '~/utils/is-nullish'

export type Falsy = Nullish | false | '' | 0 | -0 | typeof NaN | 0n
export type NotFalsy<T> = Exclude<T, Exclude<Falsy, number>>

const falsyValues: Falsy[] = [...nullishValues, false, '', 0, -0, NaN]
if (typeof BigInt === 'function') falsyValues.push(BigInt(0) as 0n)
export { falsyValues }

export function isFalsy<T> (val: T | Falsy): val is Falsy {
  return falsyValues.includes(val as any)
} 

export function isNotFalsy<T> (val: T): val is NotFalsy<T> {
  return !isFalsy(val)
}

export default isFalsy
