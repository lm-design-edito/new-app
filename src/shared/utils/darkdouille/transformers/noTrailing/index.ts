import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toString from '../toString'

const noTrailing: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const strInput = toString()(inputValue)
    const toRemoveList = resolvedArgs.length === 0 ? ['/'] : resolvedArgs.map(toString())
    let strOutput = strInput
    while (strInput.length > 0) {
      const toRemove = toRemoveList.find(str => strOutput.endsWith(str))
      if (toRemove === undefined) break;
      if (toRemove.length === 0) break;
      strOutput = strOutput.slice(0, strOutput.length - toRemove.length)
    }
    return strOutput
  }
}

export default noTrailing
