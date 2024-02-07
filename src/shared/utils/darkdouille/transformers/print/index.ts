import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import clone from '../clone'

const print: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    console.log(...resolvedArgs, clone()(inputValue))
    return inputValue
  }
}

export default print
