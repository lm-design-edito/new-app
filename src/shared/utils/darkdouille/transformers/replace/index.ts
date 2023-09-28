import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const replaceInNode = (node: Node, replacer: string | NodeListOf<Node>, ...toReplace: string[]): Node[] => {
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
    const element = node as Element
    const children = element.childNodes
    const clone = element.cloneNode() as Element
    children.forEach(child => {
      clone.append(...replaceInNode(child, replacer, ...toReplace))
    })
    return [clone]
  }
  return []
}

const replace: Darkdouille.TransformerFunctionGenerator<string | NodeListOf<Node>> = (...args) => {
  return (inputValue): string | NodeListOf<Node> => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [firstArg, ...lastArgs] = resolvedArgs
    const toReplaceArgs = [firstArg, ...lastArgs.slice(0, -1)]
    const replacerArg = lastArgs[lastArgs.length - 1]
    const toReplaceStrArgs = toReplaceArgs.filter((elt): elt is string => typeof elt === 'string')
    const replacer = replacerArg instanceof NodeList
      ? replacerArg
      : toString()(replacerArg)
    if (inputValue instanceof NodeList) {
      const nodes = [...inputValue]
      const replacedNodes = nodes.map(node => {
        const clone = node.cloneNode(true)
        return replaceInNode(clone, replacer, ...toReplaceStrArgs)
      }).flat()
      const fragment = document.createDocumentFragment()
      fragment.append(...replacedNodes)
      return fragment.childNodes
    }
    const strInput = toString()(inputValue)
    if (replacer instanceof NodeList) {
      const strInputAsTextNode = document.createTextNode(strInput)
      const replacedTextNodes = replaceInNode(strInputAsTextNode, replacer, ...toReplaceStrArgs)
      const fragment = document.createDocumentFragment()
      fragment.append(...replacedTextNodes)
      return fragment.childNodes
    }
    const splittedStrInput = toReplaceStrArgs.reduce<string[]>((splitted, splitter) => {
      return splitted
        .map(chunk => chunk.split(splitter))
        .flat()
    }, [strInput])
    return splittedStrInput.join(replacer)
  }
}

export default replace
