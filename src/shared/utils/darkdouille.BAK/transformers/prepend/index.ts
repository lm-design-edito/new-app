import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const prepend: Darkdouille.TransformerFunctionGenerator<string | NodeListOf<Node>> = (...args) => {
  return (inputValue): string | NodeListOf<Node> => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (inputValue instanceof NodeList) {
      const fakeWrapper = document.createElement('div')
      const nodes = [...inputValue].map(node => node.cloneNode(true))
      fakeWrapper.append(...nodes)
      resolvedArgs.forEach(arg => {
        if (arg instanceof NodeList) { fakeWrapper.prepend(...arg) }
        else fakeWrapper.prepend(toString()(arg))
      })
      return fakeWrapper.cloneNode(true).childNodes
    }
    const strInput = toString()(inputValue)
    return resolvedArgs.reduce<string>((prevStr, arg) => {
      return `${toString()(arg)}${prevStr}`
    }, strInput)
  }
}

export default prepend
