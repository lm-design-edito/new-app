import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'

export enum Type {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  NULL = 'null',
  LMHTML = 'lm-html',
  ARRAY = 'array',
  RECORD = 'record',
  UNDEFINED = 'undefined'
}

const typeOf: Darkdouille.TransformerFunctionGenerator<Type> = (...args) => {
  return inputValue => {
    const firstArg = resolveArgs(inputValue, ...args).at(0)
    const target = firstArg === undefined ? inputValue : firstArg
    if (target === undefined) return Type.UNDEFINED
    if (typeof target === 'string') return Type.STRING
    if (typeof target === 'number') return Type.NUMBER
    if (typeof target === 'boolean') return Type.BOOLEAN
    if (target === null) return Type.NULL
    if (target instanceof NodeList) return Type.LMHTML
    if (Array.isArray(target)) return Type.ARRAY
    return Type.RECORD
  }
}

export default typeOf
