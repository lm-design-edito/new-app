import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'

const equals: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return (inputValue): boolean => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (resolvedArgs.length === 0) return false
    return resolvedArgs.every(arg => arg === inputValue)
  }
}

export default equals
