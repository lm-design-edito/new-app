import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toString from '../toString'

const renameProp: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    if (!isRecord(inputValue)) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [rawCurrentProp, rawNextProp] = resolvedArgs
    if (rawCurrentProp === undefined || rawNextProp === undefined) return inputValue
    const currentProp = toString()(rawCurrentProp)
    const nextProp = toString()(rawNextProp)
    const returned: Darkdouille.TreeRecordValue = {}
    Object.entries(inputValue).forEach(([key, val]) => {
      if (key === currentProp) { returned[nextProp] = val }
      else { returned[key] = val }
    })
    return returned
  }
}

export default renameProp
