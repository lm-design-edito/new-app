import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = [Types.Tree.RestingValue, ...Types.Tree.RestingArrayValue]
type Output = boolean

export const equals = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'equals',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => {
    const [first, ...others] = a
    if (first === undefined) return Outcome.makeFailure(Utils.SmartTags.makeArgsValueError(
      'value',
      'undefined',
      0
    ))
    const returned = [first, ...others] as Args
    return Outcome.makeSuccess(returned)
  },
  func: (main, args) => {
    const { Text } = Window.get()
    const normalizedMain = main instanceof Text ? Cast.toString(main) : main
    const normalizedArgs = args.map(a => a instanceof Text ? Cast.toString(a) : a)
    return Outcome.makeSuccess(normalizedArgs.every(arg => arg === normalizedMain))
  }
})
