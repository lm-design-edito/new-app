import { VNode } from 'preact'
import { Base, Collection, Entry, Field } from '..'
import { TransformerType } from './types'
// One to one transformers
import toString from './one-to-one/toString'
import toNumber from './one-to-one/toNumber'
import toBoolean from './one-to-one/toBoolean'
import toNull from './one-to-one/toNull'
import toHtml from './one-to-one/toHtml'
import toRef from './one-to-one/toRef'
import toLowerCase from './one-to-one/toLowerCase'
import toUpperCase from './one-to-one/toUpperCase'
import trim from './one-to-one/trim'
// One to many transformers
import split from './one-to-many/split'
// Many to one transformers
import join from './many-to-one/join'
// Many to many transformers
import map from './many-to-many/map'

// [WIP] transformers ideas :
// - replace (string)
// - add, subtract, divide, multiply, pow, solve, min, max, clamp
// - at, filter (for arrays)
const transformerNamesObj: { [key: string]: Transformer } = {
  // One to one
  toString,
  toNumber,
  toBoolean,
  toNull,
  toHtml,
  toRef,
  toLowerCase,
  toUpperCase,
  trim,
  // One to many
  split,
  // Many to one
  join,
  // Many to many
  map
}

const transformersNames: Map<string, Transformer> = new Map(Object.entries(transformerNamesObj))
export const getTransformer = (name: string) => transformersNames.get(name)

export type PrimitiveValue = string
  |number
  |boolean
  |null
  |HTMLElement
  |VNode
  |Base
  |Collection
  |Entry
  |Field

type CommonTransformerStuff = {
  name: string
}

export type OneToOneTransformer = CommonTransformerStuff & {
  type: TransformerType.ONE_TO_ONE,
  apply: (
    value: PrimitiveValue,
    argsStr: string,
    resolve?: Field['resolve']
  ) => PrimitiveValue
}

export type OneToManyTransformer = CommonTransformerStuff & {
  type: TransformerType.ONE_TO_MANY,
  apply: (
    value: PrimitiveValue,
    argsStr: string,
    resolve?: Field['resolve']
  ) => Array<PrimitiveValue>
}

export type ManyToOneTransformer = CommonTransformerStuff & {
  type: TransformerType.MANY_TO_ONE,
  apply: (
    value: Array<PrimitiveValue>,
    argsStr: string,
    resolve?: Field['resolve']
  ) => PrimitiveValue
}

export type ManyToManyTransformer = CommonTransformerStuff & {
  type: TransformerType.MANY_TO_MANY,
  apply: (
    value: Array<PrimitiveValue>,
    argsStr: string,
    resolve?: Field['resolve']
  ) => Array<PrimitiveValue>
}

export type Transformer = 
  OneToOneTransformer
  |OneToManyTransformer
  |ManyToOneTransformer
  |ManyToManyTransformer

export function makeTransformer<T extends OneToOneTransformer> (name: CommonTransformerStuff['name'], type: TransformerType.ONE_TO_ONE, apply: T['apply']): T
export function makeTransformer<T extends OneToManyTransformer> (name: CommonTransformerStuff['name'], type: TransformerType.ONE_TO_MANY, apply: T['apply']): T
export function makeTransformer<T extends ManyToOneTransformer> (name: CommonTransformerStuff['name'], type: TransformerType.MANY_TO_ONE, apply: T['apply']): T
export function makeTransformer<T extends ManyToManyTransformer> (name: CommonTransformerStuff['name'], type: TransformerType.MANY_TO_MANY, apply: T['apply']): T
export function makeTransformer<T extends Transformer> (name: CommonTransformerStuff['name'], type: TransformerType, apply: T['apply']) {
  return {
    name,
    type,
    apply: (...args: Parameters<T['apply']>) => {
      const [value, argsStr, resolve] = args as [
        ((PrimitiveValue & PrimitiveValue[]) & PrimitiveValue[]),
        string,
        Field['resolve']
      ] // [WIP] something very dark about this cast...
      // [WIP] silent log the logs below?
      // if (argsStr !== '') console.log('apply', name, 'with', `"${argsStr}"`, 'on', value)
      // else console.log('apply', name, 'on', value)
      try {
        const result = apply(value, argsStr, resolve)
        // [WIP] silent log this?
        // console.log('output:', result)
        return result
      } catch (err) {
        // [WIP] silent log this?
        // console.log('error:', err)
        const { ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY } = TransformerType
        if (type === ONE_TO_ONE || type === MANY_TO_MANY) return value
        if (type === ONE_TO_MANY) return [value]
        if (type === MANY_TO_ONE) return value[0] ?? null
        else return null
      }
    }
  }
}

export function argsStrToArgsArr (argsStr: string): string[] {
  let replaceToken = `${crypto.randomUUID().replace(/\-/, '')}`
  while (argsStr.includes(replaceToken)) { replaceToken = `${crypto.randomUUID().replace(/\-/, '')}` }
  const replacedArgsStr = argsStr.replace(/\\s/, replaceToken)
  const replacedArgsArr = replacedArgsStr.split(/\s+/)
  const argsArr = replacedArgsArr.map(argStr => {
    return argStr.replace(new RegExp(replaceToken), ' ')
  })
  return argsArr
}

export function masterTransformer (
  value: PrimitiveValue|PrimitiveValue[],
  transformerName: string,
  transformerArgsStr: string,
  resolve?: Field['resolve']
): PrimitiveValue|PrimitiveValue[] {
  const transformer = getTransformer(transformerName)
  if (transformer === undefined) return value
  const {
    ONE_TO_ONE,
    ONE_TO_MANY,
    MANY_TO_ONE,
    MANY_TO_MANY
  } = TransformerType
  const { type, apply } = transformer
  if (Array.isArray(value)) {
    if (type !== MANY_TO_ONE
      && type !== MANY_TO_MANY) return value
    return apply(value, transformerArgsStr, resolve)
  } else {
    if (type !== ONE_TO_ONE
      && type !== ONE_TO_MANY) return value
    return apply(value, transformerArgsStr, resolve)
  }
}
