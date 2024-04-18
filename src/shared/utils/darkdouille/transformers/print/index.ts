import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import clone from '../clone'

const print: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    resolvedArgs.forEach((arg, argPos) => console.log(`arg ${argPos}:`, clone()(arg)))
    if (resolvedArgs.length === 0) console.log(clone()(inputValue))
    else console.log('input value:', clone()(inputValue))
    return inputValue
  }
}

export default print
