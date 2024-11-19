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
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'string', 'text', 'nodelist', 'element'),
  argsValueCheck: a => {
    const expectedStr = 'string | Text | NodeListOf<Element | Text> | Element'
    if (a.length === 0) return Outcome.makeFailure({ position: 0, expected: expectedStr, found: 'undefined' })
    if (a.length === 1) return Outcome.makeFailure({ position: 1, expected: expectedStr, found: 'undefined' })
    if (a.length > 2) return Outcome.makeFailure({ position: 3, expected: 'undefined', found: Utils.TypeChecks.getType(a.at(2)) ?? 'undefined' })
    const checked = Utils.TypeChecks.typeCheckMany(a, 'string', 'text', 'nodelist', 'element')
    if (!checked.success) return checked
    return Outcome.makeSuccess(checked.payload as Args)
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
