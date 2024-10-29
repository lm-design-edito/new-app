import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Utils } from '../../utils'
import { Cast } from '../../cast'
import { Types } from '../../types'

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

export const append: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    console.log('args', args)
    const makeError = Utils.makeTransformerError
    const { Element, Text, NodeList } = Window.get()
    const [...toAppend] = args
    if (typeof currentValue === 'string'
      || currentValue instanceof Text) {
      const appendable: Array<string | Text> = []
      for (const toApp of toAppend) {
        if (typeof toApp === 'string'
          || toApp instanceof Text) appendable.push(toApp)
        else return makeError({
          message: 'Strings and Texts can only be appended with other strings or Text values',
          found: toApp,
          type: Utils.getValueType(toApp)
        })
      }
      return {
        action: 'REPLACE',
        value: typeof currentValue === 'string'
          ? appendInString(currentValue, ...appendable)
          : appendInText(currentValue, ...appendable)
      }
    }
    if (currentValue instanceof Element
      || currentValue instanceof NodeList) {
      const appendable: Array<string | Text | Element | NodeListOf<Element | Text>> = []
      for (const toApp of toAppend) {
        if (typeof toApp === 'string'
          || toApp instanceof Element
          || toApp instanceof Text
          || toApp instanceof NodeList) appendable.push(toApp)
        else return makeError({
          message: 'Elements and NodeLists can only be appended with other strings, Text, Element or NodeList values',
          found: toApp,
          type: Utils.getValueType(toApp)
        })
      }
      return {
        action: 'REPLACE',
        value: currentValue instanceof Element
          ? appendInElement(currentValue, ...appendable)
          : appendInNodeList(currentValue, ...appendable)
      }
    }
    return makeError({
      message: 'Input value must be a string, Text, Element or NodeList',
      found: currentValue
    })
  })
}
