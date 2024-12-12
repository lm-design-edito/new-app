import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingArrayValue
type Args = Array<Types.Tree.RestingArrayValue>
type Output = Types.Tree.RestingArrayValue

export const pusheach = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'pusheach',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => {
    const { makeSuccess, makeFailure } = Outcome
    const { typeCheck } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    for (const [argPos, arg] of Object.entries(a)) {
      const numPos = parseInt(argPos)
      const checked = typeCheck(arg, 'array')
      if (!checked.success) return makeFailure(makeArgsValueError(
        checked.error.expected,
        checked.error.found,
        numPos
      ))
    }
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const returned = [...main]
    for (const arg of args) { returned.push(...arg) }
    return Outcome.makeSuccess(returned)
  }
})
