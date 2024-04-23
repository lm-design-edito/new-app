import { Darkdouille } from '../..'
import clone from '../clone'

const childNodes: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    if (!(inputValue instanceof NodeList)) return inputValue
    const clonedArr = Array.from(clone<NodeListOf<Node>>()(inputValue))
    const fragment = document.createDocumentFragment()
    clonedArr.forEach(node => fragment.append(...node.childNodes))
    return fragment.childNodes
  }
}

export default childNodes
