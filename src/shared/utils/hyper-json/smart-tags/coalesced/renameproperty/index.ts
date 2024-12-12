import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = [string | Text, string | Text]
type Output = Types.Tree.RestingRecordValue

export const renameproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'renameproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { typeCheck, typeCheckMany } = Utils.Tree.TypeChecks
    const checked = typeCheckMany(a, 'string', 'text')
    if (!checked.success) return checked
    const [first, second] = a
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(Utils.SmartTags.makeArgsValueError(
      firstChecked.error.expected,
      firstChecked.error.found,
      0
    ))
    const secondChecked = typeCheck(second, 'string', 'text')
    if (!secondChecked.success) return makeFailure(Utils.SmartTags.makeArgsValueError(
      secondChecked.error.expected,
      secondChecked.error.found,
      0
    ))
    return makeSuccess([firstChecked.payload, secondChecked.payload])
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
