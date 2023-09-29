import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'
import toString from '../toString'

const map: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const isString = typeof inputValue === 'string'
    const isArray = Array.isArray(inputValue)
    const isNodeList = inputValue instanceof NodeList
    if (!isString && !isArray && !isNodeList) return inputValue
    if (isString) {
      const chars = inputValue.split('')
      return chars.map(char => {
        return args.reduce<Darkdouille.TreeValue>((mapped, arg) => {
          if (typeof arg === 'function') return arg(mapped)
          else return arg
        }, char)
      }).join('')
    }
    if (isArray) {
      return inputValue.map(item => {
        return args.reduce<Darkdouille.TreeValue>((mapped, arg) => {
          if (typeof arg === 'function') return arg(mapped)
          return arg
        }, item)
      })
    }
    if (isNodeList) {
      const nodes = [...inputValue].map(node => {
        const fragment = document.createDocumentFragment()
        fragment.appendChild(node)
        return args.reduce<Darkdouille.TreeValue>((mapped, arg) => {
          if (typeof arg === 'function') return arg(mapped)
          return arg
        }, fragment.childNodes)
      }).flat()
      const fragment = document.createDocumentFragment()
      
    }
    // return arrInput.map(toMap => {
    //   const mapped = toMap
    //   if (isString) return toString()(mapped)
      
    // })
    // const resolvedNbrArgs = resolveArgs(inputValue, ...args)
    //   .map(arg => toNumber()(arg))
    // if (resolvedNbrArgs.length === 0) return inputValue
    // const nbrArgsAsArrayPositions = resolvedNbrArgs.map(nbrArg => {
    //   if (nbrArg < 0) return inputValue.length + nbrArg
    //   return nbrArg
    // })
    // const retrieved = nbrArgsAsArrayPositions
    //   .map(arrPosition => inputValue[arrPosition])
    //   .map(elt => {
    //     if (elt instanceof Node) {
    //       const fragment = document.createDocumentFragment()
    //       fragment.append(elt)
    //       return fragment.childNodes
    //     }
    //     return elt
    //   })
    // return retrieved.length < 2 ? retrieved[0] : retrieved
  }
}

export default map
