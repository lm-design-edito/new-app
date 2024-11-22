import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingRecordValue
type Args = Array<string | Text>
type Output = Types.Tree.RestingRecordValue

export const getproperties = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'getproperties',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const reduced = args.reduce<Types.Tree.RestingRecordValue>((reduced, curr) => {
      const key = Cast.toString(curr)
      const val = main[key]
      if (val === undefined) return { ...reduced }
      return { ...reduced, [key]: val }
    }, {})
    return Outcome.makeSuccess(reduced)
  }
})
