import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'

const push: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (!Array.isArray(inputValue)) return inputValue
    return [...inputValue, ...resolvedArgs]
  }
}

export default push
