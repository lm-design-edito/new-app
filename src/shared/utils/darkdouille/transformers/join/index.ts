import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const join: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (!Array.isArray(inputValue)) return inputValue
    const strArgs = resolvedArgs.map(arg => toString()(arg)).join('')
    return inputValue.map(val => toString()(val)).join(strArgs)
  }
}

export default join
