import { Darkdouille } from '../..'
import toString from '../toString'

const toHtml: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = () => {
  return (inputValue): NodeListOf<Node> => {
    if (inputValue instanceof NodeList) return inputValue
    if (Array.isArray(inputValue)) {
      const fragment = document.createDocumentFragment()
      inputValue.forEach(item => fragment.append(...toHtml()(item)))
      return fragment.childNodes
    }
    const fragment = document.createDocumentFragment()
    const textNode = document.createTextNode(toString()(inputValue))
    fragment.appendChild(textNode)
    return fragment.childNodes
  }
}

export default toHtml
