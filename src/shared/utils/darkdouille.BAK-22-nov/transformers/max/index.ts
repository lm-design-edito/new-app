import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'

const max: Darkdouille.TransformerFunctionGenerator<number> = (...args) => {
  return (inputValue): number => {
    const nbrValue = toNumber()(inputValue)
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const nbrArgs = resolvedArgs.map(arg => toNumber()(arg))
    return Math.max(nbrValue, ...nbrArgs)
  }
}

export default max
