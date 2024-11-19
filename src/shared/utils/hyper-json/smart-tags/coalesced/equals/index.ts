import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.Value
type Args = [Types.Tree.Value, ...Types.Tree.ArrayValue]
type Output = boolean

export const equals = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'equals',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => {
    const [first, ...others] = a
    if (first === undefined) return Outcome.makeFailure({
      expected: 'value',
      found: 'undefined',
      position: 0
    })
    const returned = [first, ...others] as Args
    return Outcome.makeSuccess(returned)
  },
  func: (main, args) => {
    const all = [main, ...args]
    const returned = all.every(Cast.toBoolean)
    return Outcome.makeSuccess(returned)
  }
})
