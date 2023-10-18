import { Darkdouille } from '../..'
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
      const mappedValues = [...inputValue].map(node => {
        const fragment = document.createDocumentFragment()
        fragment.appendChild(node)
        const nodeList = fragment.childNodes
        return args.reduce<Darkdouille.TreeValue>((mapped, arg) => {
          if (typeof arg === 'function') return arg(mapped)
          return arg
        }, nodeList)
      })
      const mappedNodes = mappedValues.map(value => {
        if (value instanceof NodeList || Array.isArray(value)) {
          const nodeListOrArray = value
          const emptyTextNode = document.createTextNode('')
          if (nodeListOrArray.length === 0) return emptyTextNode
          else if (nodeListOrArray.length === 1) {
            const nodeOrVal = nodeListOrArray[0]
            if (nodeOrVal === undefined) return emptyTextNode
            if (nodeOrVal instanceof Node) return nodeOrVal
            const strVal = toString()(nodeOrVal)
            const textNode = document.createTextNode(strVal)
            return textNode
          } else {
            const div = document.createElement('div')
            nodeListOrArray.forEach(elt => {
              if (elt instanceof Node) div.append(elt)
              else {
                const strElt = toString()(elt)
                const textNode = document.createTextNode(strElt)
                div.append(textNode)
              }
            })
            return div
          }
        }
        const strValue = toString()(value)
        const textNode = document.createTextNode(strValue)
        return textNode
      })
      const fragment = document.createDocumentFragment()
      fragment.replaceChildren(...mappedNodes)
      return fragment.childNodes
    }
  }
}

export default map
