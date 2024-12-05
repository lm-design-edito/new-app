import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
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
    const [first, second] = a as [Types.Tree.RestingValue, Types.Tree.RestingValue]
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(firstChecked.error.expected, firstChecked.error.found, 0))
    return makeSuccess([firstChecked.payload, second] as Args)
  },
  func: (main, args) => {
    const [key, val] = args
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    try {
      const withPropertySet = deepSetProperty(
        Utils.clone(main),
        Cast.toString(key),
        val)
      return makeSuccess(withPropertySet)
    } catch (err) {
      return makeFailure(makeTransformationError(`Impossible to access property :${key}`))
    }
  }
})

function deepSetProperty (
  record: Types.Tree.RestingRecordValue,
  pathString: string,
  value: Types.Tree.RestingValue
): Types.Tree.RestingRecordValue {
  const pathChunks = pathString.split('.')
  const clone = Utils.clone(record)
  let currentRecord = clone
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    if (isLast) { currentRecord[chunk] = value }
    else {
      const found = currentRecord[chunk]
      if (isRecord(found)) currentRecord = found
      else throw 'NOT_A_RECORD'
    }
  })
  return clone
}
