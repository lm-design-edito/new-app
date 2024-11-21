import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = boolean
type Args = []
type Output = boolean

export const negate = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'negate',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'boolean'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(!main)
})
