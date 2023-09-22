import { Darkdouille } from '../..'

function clone<T extends Darkdouille.TreeValue> ()  {
  return (inputValue: T): T => {
    if (inputValue === undefined
      || inputValue === null
      || typeof inputValue === 'number'
      || typeof inputValue === 'string'
      || typeof inputValue === 'boolean') return inputValue
    if (inputValue instanceof NodeList) {
      const fakeElement = document.createElement('div')
      fakeElement.append(...[...inputValue].map(node => (node as Node).cloneNode(true)))
      const childNodes = fakeElement.childNodes
      return childNodes as unknown as T
    }
    if (Array.isArray(inputValue)) {
      return [...inputValue.map(item => clone<typeof item>()(item))] as T
    }
    return Object.keys(inputValue).reduce((record, key) => ({
      ...record,
      [key]: clone<Darkdouille.TreeValue>()(inputValue[key])
    }), {}) as T
  }
}

export default clone
