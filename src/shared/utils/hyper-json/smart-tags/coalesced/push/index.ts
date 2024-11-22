import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingArrayValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingArrayValue

export const push = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'push',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => Outcome.makeSuccess([...main, ...args])
})
