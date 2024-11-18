import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = NodeListOf<Element | Text> | Element
type Args = Array<string | Text>
type Output = NodeListOf<Element | Text>

export const select = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'select',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'nodelist', 'element'),
  argsValueCheck: a => Utils.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const selectedFragment = document.createDocumentFragment()
    if (main instanceof Window.get().Element) {
      for (const arg of args) {
        const selector = Cast.toString(arg)
        const found = main.querySelectorAll(selector)
        selectedFragment.append(...found)
      }
    } else {
      const divWrapper = Window.get().document.createElement('div')
      divWrapper.append(...main)
      for (const arg of args) {
        const selector = Cast.toString(arg)
        const found = divWrapper.querySelectorAll(selector)
        selectedFragment.append(...found)
      }
    }
    const selected = selectedFragment.childNodes as NodeListOf<Element | Text>
    return Outcome.makeSuccess(selected)
  }
})
