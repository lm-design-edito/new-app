import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Utils } from '../../utils'
import { Cast } from '../../cast'
import { SmartTags } from '..'

type In = string | Text | Element | NodeListOf<Element | Text>
type Args = Array<string | Text | Element | NodeListOf<Element | Text>>
type Output = string | Text | Element | NodeListOf<Element | Text>

export const append = SmartTags.makeData<In, Args, Output>('append', {
  inputCheck: (i) => Utils.typeCheck(i, 'string', 'text', 'element', 'nodelist'),
  argsCheck: (args, input): Outcome.Either<Args> => {
    const { Text } = Window.get()
    if (typeof input === 'string' || input instanceof Text) {
      const allArgsAreStringOrText = args.every(arg => typeof arg === 'string' || arg instanceof Text)
      if (allArgsAreStringOrText) return SmartTags.makeArgsCheckFailure({ details: 'Every argument should be of type string or Text when input is string or Text' })
    }
    return Outcome.makeSuccess(args as Args)
  },
  outputCheck: (output, input) => {
    const firstCheck = Utils.typeCheck(output, 'string', 'text', 'element', 'nodelist')
    if (!firstCheck.success) return SmartTags.makeOutputCheckFailure(firstCheck.error)
    const checkedOutput = firstCheck.payload
    const outType = Utils.getType(checkedOutput)
    const inType = Utils.getType(input)
    if (outType !== inType) return SmartTags.makeOutputCheckFailure({
      expected: inType,
      found: outType,
      details: 'Output and input types should match'
    })
    return Outcome.makeSuccess(output as Output)
  }
}, (input, args) => {
  const { Element, Text, NodeList } = Window.get()
  let current: Output = input
  for (const arg of args) {
    const argIsStringLike = typeof arg === 'string' || arg instanceof Text
    if (typeof current === 'string' && argIsStringLike) { current = appendInString(current, arg) }
    if (current instanceof Text && argIsStringLike) { current = appendInText(current, arg) }
    if (current instanceof Element) { current = appendInElement(current, arg) }
    if (current instanceof NodeList) { current = appendInNodeList(current, arg) }
  }
  return Outcome.makeSuccess(current)
})

/* * * * * * * * * * * * * * * * * * * *
 *
 * Utils
 * 
 * * * * * * * * * * * * * * * * * * * */

function appendInString (inputString: string, ...toAppend: Array<string | Text>): string {
  const toAppendStr = toAppend.map(Cast.toString)
  return [inputString, ...toAppendStr].join('')
}

function appendInText (inputText: Text, ...toAppend: Array<string | Text>): Text {
  const { document } = Window.get()
  const textContent = appendInString(inputText.textContent ?? '', ...toAppend)
  const outText = document.createTextNode(textContent)
  return outText
}

function appendInNodeList (
  inputNodeList: NodeListOf<Element | Text>,
  ...toAppend: Array<string | Text | Element | Text | NodeListOf<Element | Text>>): NodeListOf<Element | Text> {
  const { document, NodeList } = Window.get()
  const frag = document.createDocumentFragment()
  frag.append(...Array.from(inputNodeList).map(e => e.cloneNode(true)))
  toAppend.forEach(toApp => {
    if (toApp instanceof NodeList) return frag.append(...Utils.clone(toApp))
    frag.append(Utils.clone(toApp))
  })
  return frag.childNodes as NodeListOf<Element | Text>
}

function appendInElement (
  inputElement: Element,
  ...toAppend: Array<string | Text | Element | Text | NodeListOf<Element | Text>>): Element {
  const clone = Utils.clone(inputElement)
  toAppend.forEach(toApp => {
    if (toApp instanceof NodeList) return clone.append(...Utils.clone(toApp))
    clone.append(Utils.clone(toApp))
  })
  return clone
}
