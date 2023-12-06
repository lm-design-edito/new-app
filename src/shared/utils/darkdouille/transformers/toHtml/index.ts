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
    const div = document.createElement('div')
    div.innerHTML = toString()(inputValue)
    return div.childNodes
  }
}

export default toHtml
