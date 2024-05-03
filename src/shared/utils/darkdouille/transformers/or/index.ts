import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'

const or: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return inputValue => {
    const resolved = resolveArgs(inputValue, ...args)
    const arr = [inputValue, ...resolved] 
    return arr.some(entry => entry === true)
  }
}

export default or
