import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Utils } from '../../utils'
import { SmartTags } from '..'

type Main = string | Text
type Args = Array<null | boolean | number | string | Text | Element | NodeListOf<Element | Text>>
type Output = Element

export const element = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'element',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text', 'element', 'nodelist'),
  func: (main, args) => {
    const tagName = Cast.toString(main).trim().toLowerCase()
    const { document, NodeList } = Window.get()
    const elt = document.createElement(tagName)
    for (const argVal of args) {
      if (argVal instanceof NodeList) elt.append(...argVal)
      else if (argVal instanceof Element) elt.append(argVal)
      else elt.append(Cast.toText(argVal))
    }
    return Outcome.makeSuccess(elt)
  }
})
