import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'

const greater: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return (inputValue): boolean => {
    const nbrValue = toNumber()(inputValue)
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const nbrArgs = resolvedArgs.map(arg => toNumber()(arg))
    return nbrArgs.every(nbrArg => nbrArg < nbrValue)
  }
}

export default greater
