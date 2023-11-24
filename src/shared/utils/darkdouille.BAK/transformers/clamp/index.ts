import { Darkdouille } from '../..'
import min from '../min'
import max from '../max'
import toNumber from '../toNumber'
import { resolveArgs } from '../_resolveArgs'

const clamp: Darkdouille.TransformerFunctionGenerator<number> = (...args) => {
  return (inputValue): number => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const minArg = resolvedArgs[0]
    const maxArg = resolvedArgs[1]
    const nbrMin = typeof minArg === 'number' ? minArg : 0
    const nbrMax = typeof maxArg === 'number' ? maxArg : 1
    const nbrValue = toNumber()(inputValue)
    const floored = min(nbrMax)(nbrValue)
    const clamped = max(nbrMin)(floored)
    return clamped
  }
}

export default clamp
