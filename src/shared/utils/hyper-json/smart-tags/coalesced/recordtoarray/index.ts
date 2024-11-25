import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = []
type Output = Types.Tree.RestingArrayValue

export const recordtoarray = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'recordtoarray',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(Object.values(main))
})
