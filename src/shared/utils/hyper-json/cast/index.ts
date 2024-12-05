import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Types } from '../types'
import { Utils } from '../utils'
import { Method } from '../method'

export namespace Cast {
  export const toNull = (): null => null

  export const toBoolean = (input: Types.Tree.RestingValue): boolean => {
    const { Text } = Window.get()
    if (input === null) return false
    if (typeof input === 'boolean') return input
    if (typeof input === 'number') return input !== 0
    if (typeof input === 'string' || input instanceof Text) {
      const strInput = toString(input)
      if (strInput.trim() === '') return false
      if (strInput.trim().toLowerCase() === 'false') return false
      return true
    }
    return true
  }

  export const toNumber = (input: Types.Tree.RestingValue): number => {
    const { Text } = Window.get()
    if (typeof input === 'boolean') return input ? 1 : 0
    if (typeof input === 'number') return input
    if (typeof input === 'string') return parseFloat(`${input}`)
    if (input instanceof Text) return parseFloat(`${input.textContent}`)
    return 0
  }

  export const toString = (input: Types.Tree.RestingValue): string => {
    if (typeof input === 'string') return input
    if (typeof input === 'number'
      || typeof input === 'boolean'
      || input === null) return `${input}`
    const { Element, Text, NodeList } = Window.get()
    if (input instanceof Element) return input.outerHTML
    if (input instanceof Text) return input.textContent ?? ''
    if (input instanceof NodeList) return Array.from(input).map(e => {
      if (e instanceof Element) return e.outerHTML
      return e.textContent
    }).join('')
    if (Array.isArray(input)) return input.map(toString).join('')
    if (input instanceof Method) return `[Method:${input.transformer.name}]`
    return `{${Object.entries(input).map(([key, val]) => `${key}:"${toString(val)}"`).join(',')}}`
  }
  
  export const toText = (input: Types.Tree.RestingValue): Text => {
    const { Text, document } = Window.get()
    if (input instanceof Text) return input.cloneNode(true) as Text
    return document.createTextNode(toString(input))
  }
  
  export const toElement = (input: Types.Tree.RestingValue): Element => {
    const { Element, Text, NodeList, document } = Window.get()
    if (input instanceof Element) return input.cloneNode(true) as Element
    const returned = document.createElement('div')
    if (input instanceof Text) {
      returned.append(input.cloneNode(true))
      return returned
    }
    if (input instanceof NodeList) {
      returned.append(...Array.from(input).map(e => e.cloneNode(true)))
      return returned
    }
    if (Array.isArray(input)) return returned
    if (isRecord(input)) return returned
    returned.innerHTML = `${input}`
    return returned
  }

  export const toNodeList = (input: Types.Tree.RestingValue): NodeListOf<Element | Text> => {
    const { Element, Text, NodeList, document } = Window.get()
    const parentDiv = document.createElement('div')
    if (input instanceof NodeList) {
      parentDiv.append(...Array.from(input).map(i => i.cloneNode(true)))
      return parentDiv.childNodes as NodeListOf<Element | Text>
    }
    if (input instanceof Element
      || input instanceof Text) {
      parentDiv.append(input.cloneNode(true) as Element | Text)
      return parentDiv.childNodes as NodeListOf<Element | Text>
    }
    if (Array.isArray(input)) {
      input.forEach(item => {
        if (typeof item === 'number' || typeof item === 'boolean' || item === null) parentDiv.append(`${item}`)
        else if (typeof item === 'string' || item instanceof Text || item instanceof Element) parentDiv.append(item)
        else if (item instanceof NodeList) parentDiv.append(...item)
        else if (Array.isArray(item)) parentDiv.append(...toNodeList(item))
        else parentDiv.append(toString(item))
      })
      return parentDiv.childNodes as NodeListOf<Element | Text>
    }
    if (isRecord(input)) {
      parentDiv.append(toString(input))
      return parentDiv.childNodes as NodeListOf<Element | Text>
    }
    parentDiv.innerHTML = `${input}`
    return parentDiv.childNodes as NodeListOf<Element | Text>
  }

  export const toArray = (input: Types.Tree.RestingValue): Types.Tree.RestingArrayValue => {
    const { NodeList } = Window.get()
    if (Array.isArray(input)) return [...input]
    if (input instanceof NodeList) return Array.from(input)
    return [input]
  }

  export const toRecord = (input: Types.Tree.RestingValue): Types.Tree.RestingRecordValue => {
    const isRecord = Utils.Tree.TypeChecks.typeCheck(input, 'record')
    if (isRecord.success) return { ...isRecord.payload }
    return {}
  }
}
