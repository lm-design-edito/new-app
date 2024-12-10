import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'
import { Types } from '../../../types'

type Main = Types.Tree.RestingRecordValue
type Args = [string | Text, string | Text]
type Output = Types.Tree.RestingRecordValue

export const renameproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'renameproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const checked = Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text')
    if (!checked.success) return checked
    const [first, second] = a
    const firstChecked = Utils.Tree.TypeChecks.typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return Outcome.makeFailure(Utils.SmartTags.makeArgsValueError(
      firstChecked.error.expected,
      firstChecked.error.found,
      0
    ))
    const secondChecked = Utils.Tree.TypeChecks.typeCheck(second, 'string', 'text')
    if (!secondChecked.success) return Outcome.makeFailure(Utils.SmartTags.makeArgsValueError(
      secondChecked.error.expected,
      secondChecked.error.found,
      0
    ))
    return Outcome.makeSuccess([firstChecked.payload, secondChecked.payload])
  },
  func: (main, args) => {
    const [oldKey, newKey] = args.map(Cast.toString) as [string, string]
    const returned: Output = {}
    Object.entries(main).forEach(([key, value]) => {
      const targetKey = key === oldKey ? newKey : key
      returned[targetKey] = value
    })
    return Outcome.makeSuccess(returned)
  }
})
