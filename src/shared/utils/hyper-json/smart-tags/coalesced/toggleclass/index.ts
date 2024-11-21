import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Element
type Args = Array<string | Text>
type Output = Element

export const toggleclass = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toggleclass',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    for (const arg of args) {
      // [WIP] should meet the actual implementation ? Element.classList.toggle(token: string, force?: boolean)
      main.classList.toggle(Cast.toString(arg))
    }
    return Outcome.makeSuccess(main)
  }
})
