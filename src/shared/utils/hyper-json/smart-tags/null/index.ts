import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../types'
import { Utils } from '../../utils'
import { SmartTags } from '..'

type Main = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = null

export const nullFunc = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'null',
  defaultMode: 'isolation',
  isolationInitType: 'null',
  mainValueCheck: i => Utils.TypeChecks.typeCheck(i, ...Types.Tree.valueTypesNames),
  argsValueCheck: a => Utils.TypeChecks.typeCheckMany(a, ...Types.Tree.valueTypesNames),
  func: () => Outcome.makeSuccess(null)
})
