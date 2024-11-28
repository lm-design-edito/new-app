import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = [string | Text]
type Output = Types.Tree.RestingValue

export const initialize = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'initialize',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    const first = a[0]
    if (first === undefined) return makeFailure(makeArgsValueError('string | text', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[1]) ?? 'undefined', 1))
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(firstChecked.error.expected, firstChecked.error.found, 0))
    return makeSuccess(a as Args)
  },
  func: (_main, args) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const { getInitialValueFromTypeName } = Utils.Tree
    const { isValueTypeName } = Utils.Tree.TypeChecks
    const firstArg = args[0]
    const strFirstArg = Cast.toString(firstArg).trim().toLowerCase()
    const isValueType = isValueTypeName(strFirstArg)
    if (!isValueType
      || strFirstArg === 'transformer'
      || strFirstArg === 'method') return makeFailure(makeTransformationError(`${strFirstArg} is not a valid type`))
    const initialized = getInitialValueFromTypeName(strFirstArg)
    return makeSuccess(initialized)
  }
})
