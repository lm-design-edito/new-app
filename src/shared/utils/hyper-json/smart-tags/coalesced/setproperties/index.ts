import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = [Types.Tree.RestingRecordValue]
type Output = Types.Tree.RestingRecordValue

export const setproperties = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'setproperties',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('record', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a.at(1)) ?? 'undefined', 1))
    const [first] = a as [Types.Tree.RestingValue]
    const firstChecked = typeCheck(first, 'record')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(firstChecked.error.expected, firstChecked.error.found, 0))
    return makeSuccess([firstChecked.payload])
  },
  func: (main, args) => Outcome.makeSuccess({ ...main, ...args[0] })
})
