import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toRecord from '../toRecord'
import toString from '../toString'

const prop: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue) => {
    if (!isRecord(inputValue)) return undefined
    const dkdllRecordValueInput = toRecord()(inputValue)
    const resolved = resolveArgs(inputValue, ...args)
    const [rawFirstPropName, ...rawNextPropNames] = resolved
    if (rawFirstPropName === undefined) return undefined
    const strPropName = toString()(rawFirstPropName)
    const foundProp = dkdllRecordValueInput[strPropName]
    if (rawNextPropNames.length === 0) return foundProp
    return prop(...rawNextPropNames)(foundProp)
  }
}

export default prop
