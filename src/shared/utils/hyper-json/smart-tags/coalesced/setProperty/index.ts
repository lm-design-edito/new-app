import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RecordValue
type Args = [string | Text, Types.Tree.Value]
type Output = Types.Tree.RecordValue

export const setproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'setproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    if (a.length === 0) return Outcome.makeFailure({ at: 0, expected: 'string | Text', found: 'undefined' })
    if (a.length === 1) return Outcome.makeFailure({ at: 1, expected: 'value', found: 'undefined' })
    if (a.length !== 2) return Outcome.makeFailure({ at: 2, expected: 'undefined', found: Utils.TypeChecks.getType(a.at(2)) ?? 'undefined' })
    const [first, second] = a as [Types.Tree.Value, Types.Tree.Value]
    const firstChecked = Utils.TypeChecks.typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return Outcome.makeFailure({ at: 0, ...firstChecked.error })
    return Outcome.makeSuccess([firstChecked.payload, second] as Args)
  },
  func: (main, args) => {
    const [key, val] = args
    return Outcome.makeSuccess({ ...main, [Cast.toString(key)]: val })
  }
})
