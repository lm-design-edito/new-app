import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { SmartTags } from '../..'
import { Utils } from '~/shared/hyper-json/utils'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.ArrayValue // [WIP] Typeof Global Obj

export const global = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'global',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: (_m, _a, { sourceTree }) => Outcome.makeSuccess({ ...sourceTree.globalObj })
})
