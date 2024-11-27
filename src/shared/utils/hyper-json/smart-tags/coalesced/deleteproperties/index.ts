import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'

type Main = Types.Tree.RestingRecordValue
type Args = Array<string | Text>
type Output = Types.Tree.RestingRecordValue

export const deleteproperties = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'deleteproperties',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    let returned = Utils.clone(main)
    for (const arg of args) {
      const strArg = Cast.toString(arg)
      try { returned = deepDeleteProperty(returned, strArg) }
      catch (err) { return makeFailure(makeTransformationError(`Cannot access ${strArg} from input record`)) }
    }
    return makeSuccess(returned)
  }
})

function deepDeleteProperty (record: Types.Tree.RestingRecordValue, pathString: string): Types.Tree.RestingRecordValue {
  const cloned = Utils.clone(record)
  const pathChunks = pathString.split('.')
  let currentRecord = cloned
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    if (isLast) delete currentRecord[chunk]
    else {
      const found = currentRecord[chunk]
      if (isRecord(found)) currentRecord = found
      else throw 'not a record'
    }
  })
  return cloned
}
