import { Darkdouille } from '../..'
import clone from '../clone'
import { resolveArgs } from '../_utils/resolveArgs'

const print: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (resolvedArgs.length > 0) console.log(...resolvedArgs)
    else console.log(clone()(inputValue))
    return inputValue
  }
}

export default print
