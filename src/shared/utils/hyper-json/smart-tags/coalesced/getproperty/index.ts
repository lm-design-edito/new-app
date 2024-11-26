import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = [string | Text]
type Output = Types.Tree.RestingValue

export const getproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'getproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length !== 1) return makeFailure(makeArgsValueError('undefined', getType(a.at(1)) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'string', 'text')
    if (!checked.success) return checked
    return makeSuccess(checked.payload as Args)
  },
  func: (main, args) => {
    const { getType } = Utils.Tree.TypeChecks
    const { makeTransformationError } = Utils.SmartTags
    const { makeFailure, makeSuccess } = Outcome
    const [propName] = args
    const strPropName = Cast.toString(propName)
    const val = main[strPropName]
    const valType = getType(val)
    if (valType !== undefined && valType !== 'transformer') return makeSuccess(val as Output)
    return makeFailure(makeTransformationError(`Forbidden access to key: '${strPropName}'`))
  }
})
