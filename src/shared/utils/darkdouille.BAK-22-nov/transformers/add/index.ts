import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'

const add: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    return resolvedArgs.reduce((prevValue, arg) => {
      const prevIsStrOrNbr = typeof prevValue === 'string' || typeof prevValue === 'number'
      const argIsStrOrNbr = typeof arg === 'string' || typeof arg === 'number'
      if (prevIsStrOrNbr && argIsStrOrNbr) {
        return (prevValue as number) + (arg as number)
      } else return prevValue
    }, inputValue)
  }
}

export default add
