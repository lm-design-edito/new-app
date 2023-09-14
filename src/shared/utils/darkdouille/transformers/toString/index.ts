import { Darkdouille } from '../..'

const toString: Darkdouille.TransformerGenerator<string> = () => {
  return (inputValue): string => {
    if (inputValue === undefined) return '' // undefined
    if (inputValue === null) return 'null' // null
    if (inputValue instanceof NodeList) { // NodeList
      const tempWrapper = document.createElement('div')
      tempWrapper.append(...[...inputValue].map(node => node.cloneNode(true)))
      return tempWrapper.textContent ?? ''
    }
    if (Array.isArray(inputValue)) return inputValue.map(e => toString()(e)).join('') // Array
    if (typeof inputValue === 'object') return JSON.stringify(Object // Record
      .keys(inputValue)
      .sort()
      .map(key => ({ key, strValue: toString()(inputValue[key]) }))
      .reduce((record, { key, strValue }) => {
        return { ...record, [key]: strValue }
      }, {} as Record<string, any>)
    )
    return inputValue.toString() // boolean, number, string
  }
}

export default toString
