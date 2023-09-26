import { Darkdouille } from '../..'
import toNumber from '../toNumber'

const greater: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return (inputValue): boolean => {
    const nbrValue = toNumber()(inputValue)
    const nbrArgs = args.map(arg => toNumber()(typeof arg === 'function'
      ? arg(inputValue)
      : inputValue)
    )
    return nbrArgs.every(nbrArg => nbrArg < nbrValue)
  }
}

export default greater
