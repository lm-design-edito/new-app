import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.ArrayValue
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.ArrayValue

export const push = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'push',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => Outcome.makeSuccess([...main, ...args])
})
