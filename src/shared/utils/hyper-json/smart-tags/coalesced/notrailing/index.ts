import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text
type Args = [] | [string | Text]
type Output = string | Text

export const notrailing = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'notrailing',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => {
    const { makeSuccess, makeFailure } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheck } = Utils.Tree.TypeChecks
    if (a.length === 0) return makeSuccess([])
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[1]) ?? 'undefined', 1))
    const [first] = a
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(
      firstChecked.error.expected,
      firstChecked.error.found,
      0
    ))
    return makeSuccess([firstChecked.payload] as [string | Text])
  },
  func: (main, args) => {
    const strMain = Cast.toString(main)
    const firstArg = args[0]
    const strFirstArg = Cast.toString(firstArg ?? '/')
    let strOutput = strMain
    while (strOutput.endsWith(strFirstArg)) strOutput = strOutput.slice(0, -1)
    if (typeof main === 'string') return Outcome.makeSuccess(strOutput)
    return Outcome.makeSuccess(Cast.toText(strOutput))    
  }
})
