import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '~/shared/hyper-json/types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.Value
type Args = []
type Output = Element

export const toelement = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toelement',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: m => Outcome.makeSuccess(Cast.toElement(m))
})
