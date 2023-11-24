import { Darkdouille } from '../..'

const toNumber: Darkdouille.TransformerFunctionGenerator<number> = () => {
  return (inputValue): number => {
    if (inputValue === undefined) return NaN // undefined
    if (inputValue === null) return NaN // null
    if (inputValue instanceof NodeList) { // NodeList
      const tempWrapper = document.createElement('data')
      tempWrapper.append(...[...inputValue].map(node => node.cloneNode(true)))
      return parseFloat(tempWrapper.innerHTML)
    }
    if (Array.isArray(inputValue)) return inputValue.length // Array
    if (typeof inputValue === 'object') return Object.keys(inputValue).length // Record
    if (typeof inputValue === 'boolean') return inputValue ? 1 : 0 // boolean
    if (typeof inputValue === 'string') return parseFloat(inputValue) // string
    return inputValue
  }
}

export default toNumber
