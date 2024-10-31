import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { recordMap } from '@design-edito/tools/agnostic/objects/record-map'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Generators } from '../generators'
import { Types } from '../types'

export namespace Utils {
  export function clone<T extends Types.Tree.Value = Types.Tree.Value> (value: T): T {
    const { Element, Text, NodeList, document } = Window.get()
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null) return value
    if (Array.isArray(value)) return [...value.map(clone)] as T
    if (value instanceof Element) return value.cloneNode(true) as T
    if (value instanceof Text) return value.cloneNode(true) as T
    if (value instanceof Generators.Transformer) return Generators.Transformer.clone(value) as T
    if (value instanceof Generators.Method) return Generators.Method.clone(value) as T
    if (value instanceof NodeList) {
      const frag = document.createDocumentFragment()
      const nodes = Array.from(value).map(e => e.cloneNode(true) as Element | Text)
      frag.append(...nodes)
      return frag.childNodes as T
    }
    if (isRecord(value)) return recordMap(value, prop => clone(prop as Types.Tree.Value)) as T
    throw new Error(`Unexpected value input: ${value}`)
  }

  export function reduceValues (
    currentValue: Types.Tree.Value,
    subpath: string | number,
    subvalue: Types.Tree.Value): Types.Tree.Value {
    
    const { Element, Text, NodeList, document } = Window.get()
    
    // If subvalue is a Transformer, apply it
    if (subvalue instanceof Generators.Transformer) {
      const transformer = subvalue
      const transformed = transformer.apply(currentValue)
      if (transformed.success === false) return currentValue
      else return transformed.value
    }
  
    if (Array.isArray(currentValue)) return [...currentValue, subvalue]
    if (currentValue === null) return subvalue
    if (typeof currentValue === 'boolean') return subvalue
    if (typeof currentValue === 'number') return subvalue
    if (currentValue instanceof Generators.Transformer) return subvalue
    if (currentValue instanceof Generators.Method) return subvalue
    
    if (typeof currentValue === 'string') {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) return `${currentValue}${subvalue}`
      if (subvalue instanceof Text) return `${currentValue}${subvalue.textContent}`
      if (subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, Utils.clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, ...Utils.clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof Text) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) return document.createTextNode(`${currentValue.textContent}${subvalue}`)
      if (subvalue instanceof Text) return document.createTextNode(`${currentValue.textContent}${subvalue.textContent}`)
      if (subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof Element) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), `${subvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof Text || subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof NodeList) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), `${subvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof Text || subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
    
    // current value is a record here
    if (typeof subpath === 'number') return { ...currentValue }
    return {
      ...currentValue,
      [subpath]: subvalue
    }
  }

  // [WIP] typechecks should be in its own util lib
  function singleTypeCheck<K extends keyof Types.Tree.ValueTypesIndex> (
    value: unknown,
    type: K
  ): value is Types.Tree.ValueTypesIndex[K] {
    const { Element, Text, NodeList } = Window.get()
    if (type === 'any' && getType(value) !== undefined) return true
    if (type === 'null' && value === null) return true
    if (type === 'boolean' && typeof value === 'boolean') return true
    if (type === 'number' && typeof value === 'number') return true
    if (type === 'string' && typeof value === 'string') return true
    if (type === 'element' && value instanceof Element) return true
    if (type === 'text' && value instanceof Text) return true
    if (type === 'nodelist' && value instanceof NodeList) return true
    if (type === 'transformer' && value instanceof Generators.Transformer) return true
    if (type === 'method' && value instanceof Generators.Method) return true
    if (type === 'array' && Array.isArray(value)) return true
    if (type === 'record' && isRecord(value)) return true
    return false
  }

  export function typeCheck<K extends Array<keyof Types.Tree.ValueTypesIndex>> (
    value: unknown,
    ...types: K
  ): value is Types.Tree.ValueTypesIndex[K[number]] {
    return types.some(type => singleTypeCheck(value, type))
  }

  export function getType<T extends unknown> (
    value: T
  ): T extends Types.Tree.Value
    ? keyof Types.Tree.ValueTypesIndex
    : keyof Types.Tree.ValueTypesIndex | undefined {
    if (value === null) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (value instanceof Element) return 'element'
    if (value instanceof Text) return 'text'
    if (value instanceof NodeList) return 'nodelist'
    if (value instanceof Generators.Transformer) return 'transformer'
    if (value instanceof Generators.Method) return 'method'
    if (Array.isArray(value)) return 'array'
    if (isRecord(value)) return 'record'
    return undefined as T extends Types.Tree.Value
      ? keyof Types.Tree.ValueTypesIndex
      : keyof Types.Tree.ValueTypesIndex | undefined
  }
}
