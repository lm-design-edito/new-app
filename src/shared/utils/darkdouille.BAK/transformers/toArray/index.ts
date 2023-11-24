import { Darkdouille } from '../..'
import toNumber from '../toNumber'
import clone from '../clone'
import { resolveArgs } from '../_resolveArgs'

const toArray: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue[]> = (...args) => {
  return (inputValue): Darkdouille.TreeValue[] => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const arrayLengthArg = resolvedArgs[0]
    let targetArrayLength: number | undefined = undefined
    if (arrayLengthArg === undefined) { targetArrayLength = undefined }
    else { targetArrayLength = toNumber()(arrayLengthArg) }
    if (Array.isArray(inputValue)) {
      if (targetArrayLength === undefined) return inputValue
      return new Array(targetArrayLength)
        .fill(null)
        .map((_, pos) => clone()(inputValue[pos]))
    } else {
      return new Array(targetArrayLength)
        .fill(null)
        .map(() => clone()(inputValue))
    }
  }
}

export default toArray
