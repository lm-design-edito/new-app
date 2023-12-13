import { Darkdouille } from '../..'

const length: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = () => {
  return (inputValue) => {
    if (typeof inputValue === 'string') return inputValue.length
    if (inputValue instanceof NodeList) return inputValue.length
    if (Array.isArray(inputValue)) return inputValue.length
    return inputValue
  }
}

export default length
