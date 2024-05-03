import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'

const and: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return inputValue => {
    const resolved = resolveArgs(inputValue, ...args)
    const arr = [inputValue, ...resolved]
    return arr.every(entry => entry === true)
  }
}

export default and
