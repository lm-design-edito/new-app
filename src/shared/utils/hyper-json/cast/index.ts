import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { isFalsy } from '@design-edito/tools/agnostic/booleans/is-falsy'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Types } from '../types'

type Value = Types.Value
const getWindow = Window.get

export namespace Cast {
  export const toNull = (): null => null
  export const toBoolean = (input: Value): boolean => !isFalsy(input)
  export const toNumber = (input: Value): number => {
    const { Text } = getWindow()
    if (typeof input === 'number') return input
    if (typeof input === 'string') return parseFloat(`${input}`)
    if (input instanceof Text) return parseFloat(`${input.textContent}`)
    return 0
  }

  export const toString = (input: Value): string => {
    if (typeof input === 'string') return input
    if (typeof input === 'number'
      || typeof input === 'boolean'
      || input === null) return `${input}`
    const { Element, Text, NodeList } = getWindow()
    if (input instanceof Element) return input.outerHTML
    if (input instanceof Text) return input.textContent ?? ''
    if (input instanceof NodeList) return Array.from(input).map(e => {
      if (e instanceof Element) return e.outerHTML
      return e.textContent
    }).join('')
    if (Array.isArray(input)) return input.map(toString).join('')
    return input.toString()
  }
  
  export const toText = (input: Value): Text => {
    const { Text, document } = getWindow()
    if (input instanceof Text) return input.cloneNode(true) as Text
    return document.createTextNode(toString(input))
  }
  
  export const toElement = (input: Value): Element => {
    const { Element, Text, NodeList, document } = getWindow()
    if (input instanceof Element) return input.cloneNode(true) as Element
    const elt = document.createElement('div')
    if (input instanceof Text) {
      elt.append(input.cloneNode(true))
      return elt
    }
    if (input instanceof NodeList) {
      elt.append(...Array.from(input).map(e => e.cloneNode(true)))
      return elt
    }
    if (Array.isArray(input)) return elt
    if (isRecord(input)) return elt
    elt.innerHTML = `${input}`
    return elt
  }

  export const toNodeList = (input: Value): NodeListOf<Element | Text> => {
    const { Element, Text, NodeList, document } = getWindow()
    const elt = document.createElement('div')
    if (input instanceof NodeList) {
      elt.append(...Array.from(input).map(i => i.cloneNode(true)))
      return elt.childNodes as NodeListOf<Element | Text>
    }
    if (input instanceof Element
      || input instanceof Text) {
      elt.append(input.cloneNode(true) as Element | Text)
      return elt.childNodes as NodeListOf<Element | Text>
    }
    if (Array.isArray(input)) return elt.childNodes as NodeListOf<Element | Text>
    if (isRecord(input)) return elt.childNodes as NodeListOf<Element | Text>
    elt.innerHTML = `${input}`
    return elt.childNodes as NodeListOf<Element | Text>
  }

  export const toArray = (input: Value): Value[] => {
    const { NodeList } = getWindow()
    if (Array.isArray(input)) return [...input]
    if (input instanceof NodeList) return Array.from(input)
    return [input]
  }

  export const toRecord = (input: Value): ({ [k: string]: Value }) => {
    if (isRecord(input)) return { ...input }
    return {}
  }
}
