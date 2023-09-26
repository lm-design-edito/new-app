import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'

const multiply: Darkdouille.TransformerFunctionGenerator<number> = (...args) => {
  return (inputValue): number => {
    const nbrValue = toNumber()(inputValue)
    const resolvedArgs = resolveArgs(inputValue, ...args)
    return resolvedArgs.reduce<number>((prevValue, arg) => {
      const nbrArg = toNumber()(arg)
      return prevValue * nbrArg
    }, nbrValue)
  }
}

export default multiply
