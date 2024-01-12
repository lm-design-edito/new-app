import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'

const at: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const isString = typeof inputValue === 'string'
    const isArray = Array.isArray(inputValue)
    const isNodeList = inputValue instanceof NodeList
    if (!isString && !isArray && !isNodeList) return inputValue
    const resolvedNbrArgs = resolveArgs(inputValue, ...args)
      .map(arg => toNumber()(arg))
    if (resolvedNbrArgs.length === 0) return inputValue
    const nbrArgsAsArrayPositions = resolvedNbrArgs.map(nbrArg => {
      if (nbrArg < 0) return inputValue.length + nbrArg
      return nbrArg
    })
    const retrieved = nbrArgsAsArrayPositions
      .map(arrPosition => inputValue[arrPosition])
      .map(elt => {
        if (elt instanceof Node) {
          const fragment = document.createDocumentFragment()
          fragment.append(elt)
          return fragment.childNodes
        }
        return elt
      })
    return retrieved.length > 1 ? retrieved[0] : retrieved
  }
}

export default at
