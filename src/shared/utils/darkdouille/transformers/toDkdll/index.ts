import { toUSVString } from 'util'
import { Darkdouille } from '../..'
import clone from '../clone'
import toHtml from '../toHtml'

const toDkdll: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node> | string> = () => {
  return (inputValue): NodeListOf<Node> | string => {
    if (inputValue === undefined) return ''
    if (typeof inputValue === 'string') return inputValue
    if (typeof inputValue === 'number') return `${inputValue}`
    if (typeof inputValue === 'boolean') return `${inputValue}`
    if (inputValue === null) return 'null'
    if (inputValue instanceof NodeList) return inputValue
    const fakeDiv = document.createElement('div')
    if (Array.isArray(inputValue)) {

    } else {
      inputValue
    }
    console.log('I am toDkdll', inputValue)
    fakeDiv.innerHTML = '<span>yay</span>'
    return fakeDiv.childNodes
  }
}

export default toDkdll
