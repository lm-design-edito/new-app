import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text | NodeListOf<Element | Text> | Element | Types.Tree.RestingArrayValue
type Args = Array<string | Text | NodeListOf<Element | Text> | Element | Types.Tree.RestingArrayValue>
type Output = string | Text | NodeListOf<Element | Text> | Element | Types.Tree.RestingArrayValue

export const append = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'append',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text', 'nodelist', 'element', 'array'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text', 'nodelist', 'element', 'array'),
  func: (main, args) => {
    const { Text, Element, NodeList, document } = Window.get()
    if (Array.isArray(main)) return Outcome.makeSuccess([...main, ...args])
    if (main instanceof Element) {
      main.append(...Cast.toNodeList(args))
      return Outcome.makeSuccess(main)
    }
    if (main instanceof NodeList) {
      const frag = document.createDocumentFragment()
      frag.append(...main, ...Cast.toNodeList(args))
      return Outcome.makeSuccess(frag.childNodes as NodeListOf<Element | Text>)
    }
    if (main instanceof Text) {
      const reducedString = args.reduce<string>((reduced, arg) => {
        return `${reduced}${Cast.toString(arg)}`
      }, Cast.toString(main))
      return Outcome.makeSuccess(Cast.toText(reducedString))
    }
    return Outcome.makeSuccess(args.reduce<string>((reduced, arg) => {
      return `${reduced}${Cast.toString(arg)}`
    }, main))
  }
})
