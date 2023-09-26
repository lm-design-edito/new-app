import replaceAll from '~/utils/replace-all'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const replaceInNode = (
  node: Node,
  replacer: string | NodeListOf<Node>,
  ...toReplace: string[]): Node[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const { textContent } = node
    if (textContent === null) return [node.cloneNode(true)]
    const textContentArr = toReplace.reduce<string[]>((textContentArr, itemToReplace) => {
      return textContentArr
        .map(chunk => chunk.split(itemToReplace))
        .flat()
    }, [textContent])
    if (typeof replacer === 'string') {
      const replacedTextContent = textContentArr.join(replacer)
      return [document.createTextNode(replacedTextContent)]
    } else {
      const nodesList = textContentArr.map(textChunk => [
        document.createTextNode(textChunk),
        ...[...replacer].map(elt => elt.cloneNode(true))
      ]).flat()
      return nodesList
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const children = node.childNodes
    const clone = node.cloneNode()
    return [node]
  }
  return []
}

const replace: Darkdouille.TransformerFunctionGenerator<string | NodeListOf<Node>> = (...args) => {
  return (inputValue): string | NodeListOf<Node> => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [firstArg, ...lastArgs] = resolvedArgs
    const toReplaceArgs = [firstArg, ...lastArgs.slice(0, -1)]
    const replacerArg = lastArgs[lastArgs.length - 1]
    if (inputValue instanceof NodeList) {
      // const fakeWrapper = document.createElement('div')
      // const nodes = [...inputValue].map(node => node.cloneNode(true))
      // fakeWrapper.append(...nodes)
      // resolvedArgs.forEach(arg => {
      //   if (arg instanceof NodeList) { fakeWrapper.prepend(...arg) }
      //   else fakeWrapper.prepend(toString()(arg))
      // })
      // return fakeWrapper.cloneNode(true).childNodes
    }
    const strInput = toString()(inputValue)
    return resolvedArgs.reduce<string>((prevStr, arg) => {
      return `${toString()(arg)}${prevStr}`
    }, strInput)
  }
}

export default replace
