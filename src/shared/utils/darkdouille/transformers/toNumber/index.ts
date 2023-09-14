import { Darkdouille } from '../..'

const toNumber: Darkdouille.TransformerGenerator<number> = () => {
  return (inputValue): number => {
    if (inputValue === undefined) return NaN // undefined
    if (inputValue === null) return NaN // null
    if (inputValue instanceof NodeList) return inputValue.length // NodeList
    if (Array.isArray(inputValue)) return inputValue.length // Array
    if (typeof inputValue === 'object') return Object.keys(inputValue).length // Record
    if (typeof inputValue === 'boolean') return inputValue ? 1 : 0 // boolean
    if (typeof inputValue === 'string') return parseFloat(inputValue) // string
    return inputValue
  }
}

export default toNumber
