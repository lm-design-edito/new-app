import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = boolean
type Args = [
  then: Types.Tree.RestingValue,
  otherwise: Types.Tree.RestingValue
]
type Output = Args[0] | Args[1]

export const ifFunc = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'if',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'boolean'),
  argsValueCheck: a => {
    if (a.length > 2) return Outcome.makeFailure({
      expected: 'value',
      found: 'undefined',
      position: a.length
    })
    if (a.length < 2) return Outcome.makeFailure({
      expected: 'undefined',
      found: 'value',
      position: 2
    })
    return Outcome.makeSuccess(a as Args)
  },
  func: (main, args) => {
    const [then, otherwise] = args
    return Outcome.makeSuccess(main ? then : otherwise)
  }
})
