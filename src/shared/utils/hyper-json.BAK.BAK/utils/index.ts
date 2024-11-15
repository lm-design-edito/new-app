import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Tree } from '../tree'
import { Types } from '../types'
import { recordMap } from '@design-edito/tools/agnostic/objects/record-map'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'

export namespace Utils {
  export const pathStringToPath = (pathString: Tree.Tree['pathString']): Tree.Tree['path'] => {
    let cleanPathString = pathString
    while (cleanPathString.startsWith('/')) { cleanPathString = cleanPathString.slice(1) }
    while (cleanPathString.endsWith('/')) { cleanPathString = cleanPathString.slice(0, -1) }
    return cleanPathString.split('/').map(e => {
      const parsed = parseInt(e)
      const isValidNumber = !Number.isNaN(parsed) && `${parsed}` === e
      if (isValidNumber) return parsed
      return e
    })
  }

  export const pathToPathString = (path: Tree.Tree['path']) => `/${path.map(e => `${e}`).join('/')}`

  type ErrReturn = Types.TransformerErrorReturnType
  export const makeTransformerError = (value: ErrReturn['value']): ErrReturn => ({
    action: 'ERROR',
    value
  })

  export const toNamedTransformer = (
    name: string,
    args: Types.Value[],
    anonymous: Types.AnonymousTransformer): Types.Transformer => {
    const named = anonymous as Types.Transformer
    named.transformerName = name
    named.args = args
    return named
  }

  export const toHyperJson = (
    value: Types.Value,
    keyAttribute: string = Tree.defaultKeyAttribute): Element => {
    const { document, Element, Text, NodeList } = Window.get()
    if (value instanceof Text) {
      const elt = document.createElement('text')
      elt.innerHTML = value.textContent ?? ''
      return elt
    }
    if (value instanceof Element) return value.cloneNode(true) as Element
    if (value instanceof NodeList) {
      const elt = document.createElement('nodelist')
      elt.append(...Array.from(value).map(e => e.cloneNode(true)))
      return elt
    }
    if (value === null) return document.createElement('null')
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean') {
      const elt = document.createElement(typeof value)
      elt.innerHTML = `${value}`
      return elt
    }
    if (typeof value === 'function') {
      const name = value.transformerName
      const args = value.args
      const elt = document.createElement(name)
      const hyperJsonArgs = args.map(arg => toHyperJson(arg, keyAttribute))
      elt.append(...hyperJsonArgs)
      return elt
    }
    if (Array.isArray(value)) {
      const elt = document.createElement('array')
      elt.append(...value.map(e => toHyperJson(e, keyAttribute)))
      return elt
    }
    // Value is record
    const elt = document.createElement('record')
    Object.entries(value).forEach(([key, val]) => {
      const hjVal = toHyperJson(val)
      hjVal.setAttribute(keyAttribute, key)
      elt.append(hjVal)
    })
    return elt
  }

  export function clone<T extends Types.Value = Types.Value> (value: T): T {
    const { Element, Text, NodeList, document } = Window.get()
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null) return value
    if (Array.isArray(value)) return [...value.map(clone)] as T
    if (value instanceof Element) return value.cloneNode(true) as T
    if (value instanceof Text) return value.cloneNode(true) as T
    if (typeof value === 'function') {
      const { name, args } = value
      return Utils.toNamedTransformer(name, args, (
        currentValue: Types.Value,
        callerTree: Tree.Tree
      ) => value(currentValue, callerTree)) as T
    }
    if (value instanceof NodeList) {
      const frag = document.createDocumentFragment()
      const nodes = Array.from(value).map(e => e.cloneNode(true) as Element | Text)
      frag.append(...nodes)
      return frag.childNodes as T
    }
    if (isRecord(value)) return recordMap(value, prop => clone(prop as Types.Value)) as T
    throw new Error(`Unexpected value input: ${value}`)
  }

  export function toNodeListOfElementOrText (nodelist: NodeList): NodeListOf<Element | Text> {
    const { Element, Text, document } = Window.get()
    const children = Array.from(nodelist).filter(e => e instanceof Element || e instanceof Text)
    const frag = document.createDocumentFragment()
    frag.append(...children)
    return frag.childNodes as NodeListOf<Element | Text>
  }

  export type ValueTypeString = 'null' | 'number' | 'string' | 'boolean' | 'element' | 'text' | 'nodelist' | 'array' | 'record' | 'transformer'

  export function getValueType (value: Types.Value): ValueTypeString {
    if (value === null) return 'null'
    if (typeof value === 'number'
      || typeof value === 'string'
      || typeof value === 'boolean') return typeof value as ValueTypeString
    if (typeof value === 'function') return 'transformer'
    const { Element, Text, NodeList } = Window.get()
    if (value instanceof Element) return 'element'
    if (value instanceof Text) return 'text'
    if (value instanceof NodeList) return 'nodelist'
    if (Array.isArray(value)) return 'array'
    return 'record'
  }

  export function valueTypeCheck<Assumed extends Types.Value> (value: Types.Value, ...types: ValueTypeString[]): value is Assumed {
    const valueType = getValueType(value)
    return types.includes(valueType)
  }
}
