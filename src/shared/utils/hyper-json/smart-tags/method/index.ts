import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'

type Input = string | Text
type Args = Array<Types.Tree.MethodValue>
type Output = Types.Tree.MethodValue

export const method = Utils.SmartTags.makeData<Input, Args, Output>('method', {
  inputCheck: i => Utils.typeCheck(i, 'string', 'text'),
  argsCheck: args => Utils.typeCheckMany(args, 'method'),
  outputCheck: o => Utils.typeCheck(o, 'method')
}, (input, args) => {
  
  
  
  // const { NodeList } = Window.get()
  // const returned = document.createDocumentFragment()
  // Array.from([input, ...args]).forEach(item => {
  //   if (item instanceof NodeList) returned.append(...item)
  //   else returned.append(item)
  // })
  // return Outcome.makeSuccess(returned.childNodes as NodeListOf<Element | Text>)
})  
