import { Darkdouille } from '../..'

const toNumber: Darkdouille.TransformerFunctionGenerator<number> = () => {
  return (inputValue): number => {
    if (inputValue === undefined) return NaN // undefined
    if (inputValue === null) return NaN // null
    if (inputValue instanceof NodeList) return NaN // NodeList
    if (Array.isArray(inputValue)) return NaN // Array
    if (typeof inputValue === 'object') return NaN // Record
    if (typeof inputValue === 'boolean') return inputValue ? 1 : 0 // boolean
    if (typeof inputValue === 'string') return parseFloat(inputValue) // string
    return inputValue
  }
}

export default toNumber
