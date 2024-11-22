import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = Types.Tree.RestingRecordValue[]
type Output = Types.Tree.RestingRecordValue

export const record = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'record',
  defaultMode: 'isolation',
  isolationInitType: 'record',
  mainValueCheck: i => Utils.Tree.TypeChecks.typeCheck(i, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'record'),
  func: (main, args) => Outcome.makeSuccess(args.reduce((reduced, current) => ({
    ...reduced,
    ...current
  }), main))
})
 