import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'

const equals: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return (inputValue): boolean => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    return resolvedArgs.every(arg => arg === inputValue)
  }
}

export default equals
