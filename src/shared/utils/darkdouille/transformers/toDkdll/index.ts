import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import typeOf from '../typeOf'

const toDkdll: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node> | string> = () => {
  return (inputValue): NodeListOf<Node> | string => {
    if (inputValue === undefined) return ''
    if (typeof inputValue === 'string') return inputValue
    if (typeof inputValue === 'number') return `${inputValue}`
    if (typeof inputValue === 'boolean') return `${inputValue}`
    if (inputValue === null) return 'null'
    if (inputValue instanceof NodeList) return inputValue
    const fragment = document.createDocumentFragment()
    const childrenKeyValPairs: Array<{
      key: string | undefined
      val: Darkdouille.TreeValue
    }> = Array.isArray(inputValue)
      ? inputValue.map(val => ({ key: undefined, val }))
      : Object.entries(inputValue).map(([key, val]) => ({ key, val }))
    childrenKeyValPairs.forEach(({ key, val }) => fragment.append(toDkdllProperty(val, key)))
    return fragment.childNodes
  }
}

function toDkdllProperty (item: Darkdouille.TreeValue, propName?: string) {
  const type = typeOf()(item)
  const wrapper = document.createElement(type)
  if (propName !== undefined) wrapper.classList.add(propName)
  if (Array.isArray(item) || isRecord(item)) {
    const children = toDkdll()(item)
    if (typeof children === 'string') wrapper.append(children)
    else wrapper.append(...children)
  }
  else if (item instanceof NodeList) wrapper.append(...item)
  else wrapper.append(`${item}`)
  return wrapper
}

export default toDkdll
