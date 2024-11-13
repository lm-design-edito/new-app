import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'

type Input = string | Text | Element | NodeListOf<Element | Text>
type Args = Array<string | Text | Element | NodeListOf<Element | Text>>
type Output = NodeListOf<Element | Text>

export const nodelist = Utils.SmartTags.makeData<Input, Args, Output>('nodelist', {
  inputCheck: i => Utils.typeCheck(i, 'string', 'text', 'element', 'nodelist'),
  argsCheck: args => Utils.typeCheckMany(args, 'string', 'text', 'element', 'nodelist'),
  outputCheck: o => Utils.typeCheck(o, 'nodelist')
}, (input, args) => {
  const { NodeList } = Window.get()
  const returned = document.createDocumentFragment()
  Array.from([input, ...args]).forEach(item => {
    if (item instanceof NodeList) returned.append(...item)
    else returned.append(item)
  })
  return Outcome.makeSuccess(returned.childNodes as NodeListOf<Element | Text>)
})  
