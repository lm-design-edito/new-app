import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '~/shared/hyper-json/types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.Value
type Args = []
type Output = boolean

export const toboolean = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toboolean',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: m => Outcome.makeSuccess(Cast.toBoolean(m))
})
