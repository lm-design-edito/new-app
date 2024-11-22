import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'
import { replaceAll } from '@design-edito/tools/agnostic/strings/replace-all'

type Main = string | Text | NodeListOf<Element | Text> | Element
type Arg = string | Text | NodeListOf<Element | Text> | Element
type Args = [Arg, Arg]
type Output = string | Text | NodeListOf<Element | Text> | Element

export const replace = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'replace',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text', 'nodelist', 'element'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    const expectedStr = 'string | Text | NodeListOf<Element | Text> | Element'
    if (a.length === 0) return makeFailure(makeArgsValueError(expectedStr, 'undefined', 0))
    if (a.length === 1) return makeFailure(makeArgsValueError(expectedStr, 'undefined', 1))
    if (a.length > 2) return makeFailure(makeArgsValueError('undefined', getType(a.at(2)) ?? 'undefined', 3))
    const checked = typeCheckMany(a, 'string', 'text', 'nodelist', 'element')
    if (!checked.success) return checked
    return makeSuccess(checked.payload as Args)
  },
  func: (main, args) => {
    const [toReplace, replacer] = args
    const strMain = Cast.toString(main)
    const strToReplace = Cast.toString(toReplace)
    const strReplacer = Cast.toString(replacer)
    const strReplaced = replaceAll(strMain, strToReplace, strReplacer, 1e4)
    let returned: Output
    if (typeof main === 'string') { returned = strReplaced }
    else if (main instanceof Text) { returned = Cast.toText(strReplaced) }
    else if (main instanceof Element) { returned = Cast.toElement(strReplaced) }
    else { returned = Cast.toNodeList(strReplaced) }
    return Outcome.makeSuccess(returned)
  }
})
