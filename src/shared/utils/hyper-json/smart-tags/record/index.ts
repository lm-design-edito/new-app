import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { SmartTags } from '..'
import { Types } from '../../types'
import { Utils } from '../../utils'

type Main = Types.Tree.RecordValue
type Args = Types.Tree.RecordValue[]
type Output = Types.Tree.RecordValue

export const record = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'record',
  defaultMode: 'isolation',
  isolationInitType: 'record',
  mainValueCheck: i => Utils.TypeChecks.typeCheck(i, 'record'),
  argsValueCheck: a => Utils.TypeChecks.typeCheckMany(a, 'record'), // [WIP] (see comment for boolean) or maybe dont allow parameters, like other value-type smart tags do (boolean, number, string, etc...) ?
  func: (main, args) => Outcome.makeSuccess(args.reduce((reduced, current) => ({
    ...reduced,
    ...current
  }), main))
})
 