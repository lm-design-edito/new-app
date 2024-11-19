import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '~/shared/hyper-json/types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.Value
type Args = []
type Output = Types.Tree.ArrayValue

export const toarray = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toarray',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => Outcome.makeSuccess(Cast.toArray(main))
})
