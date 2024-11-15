import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Cast } from '../../cast'

type Input = string | Text | Element
type Args = Array<string | Text | Element | NodeListOf<Element | Text>>
type Output = Element

export const element = Utils.SmartTags.makeData<Input, Args, Output>('element', {
  inputCheck: i => Utils.typeCheck(i, 'string', 'text', 'element'),
  argsCheck: args => Utils.typeCheckMany(args, 'string', 'text', 'element', 'nodelist'),
  outputCheck: o => Utils.typeCheck(o, 'element')
}, (input, args) => {
  const { Text, NodeList } = Window.get()
  let returned: Element
  if (typeof input === 'string' || input instanceof Text) { returned = document.createElement(Cast.toString(input)) }
  else { returned = Utils.clone(input) }
  args.forEach(arg => {
    if (arg instanceof NodeList) { returned.append(...arg) }
    else { returned.append(arg) }
  })
  return Outcome.makeSuccess(returned)
})  
