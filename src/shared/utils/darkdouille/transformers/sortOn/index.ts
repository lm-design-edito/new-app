import isArrayOf from '~/utils/is-array-of'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import isRecord from '~/utils/is-record'
import toBoolean from '../toBoolean'

const sortOn: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    if (!Array.isArray(inputValue)) return inputValue
    if (!isArrayOf<Record<string, unknown>>(inputValue, i => isRecord(i))) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const sortProp = resolvedArgs[0]
    const rawReverseOutput = resolvedArgs[1]
    const reverseOutput = rawReverseOutput === undefined ? false : toBoolean(rawReverseOutput)
    const sorted = [...inputValue].sort((a, b) => {
      if (typeof sortProp !== 'string') return 0
      const aProp = a[sortProp]
      const bProp = b[sortProp]
      if (typeof aProp !== typeof bProp) return 0
      if (typeof aProp === 'number' && typeof bProp === 'number') return aProp - bProp
      if (typeof aProp === 'string' && typeof bProp === 'string') return aProp.localeCompare(bProp)
      return 0
    })
    return reverseOutput ? sorted.reverse() : sorted
  }
}

export default sortOn
