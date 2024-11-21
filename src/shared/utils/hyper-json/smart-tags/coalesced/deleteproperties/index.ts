import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RecordValue
type Args = Array<string | Text>
type Output = Types.Tree.RecordValue

export const deleteproperties = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'deleteproperties',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const returned = { ...main }
    for (const arg of args) {
      const strArg = Cast.toString(arg)
      delete returned[strArg]
    }
    return Outcome.makeSuccess(returned)
  }
})
