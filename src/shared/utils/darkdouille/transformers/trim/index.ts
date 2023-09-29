import { Darkdouille } from '../..'

const trim: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    if (typeof inputValue === 'string') return inputValue.trim()
    return inputValue
  }
}

export default trim
