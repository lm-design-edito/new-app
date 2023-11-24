import { Darkdouille } from '../..'
import toString from '../toString'

const toHtml: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = () => {
  return (inputValue): NodeListOf<Node> => {
    if (inputValue instanceof NodeList) return inputValue
    const strValue = toString()(inputValue)
    const fakeElement = document.createElement('div')
    fakeElement.innerHTML = strValue
    return fakeElement.childNodes
  }
}

export default toHtml
