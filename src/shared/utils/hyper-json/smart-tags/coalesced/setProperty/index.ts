import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = [string | Text, Types.Tree.RestingValue]
type Output = Types.Tree.RestingRecordValue

export const setproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'setproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length === 1) return makeFailure(makeArgsValueError('value', 'undefined', 1))
    if (a.length !== 2) return makeFailure(makeArgsValueError('undefined', getType(a.at(2)) ?? 'undefined', 2))
    const [first, second] = a as [Types.Tree.Value, Types.Tree.Value]
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(firstChecked.error.expected, firstChecked.error.found, 0))
    return makeSuccess([firstChecked.payload, second] as Args)
  },
  func: (main, args) => {
    const [key, val] = args
    return Outcome.makeSuccess({ ...main, [Cast.toString(key)]: val })
  }
})
