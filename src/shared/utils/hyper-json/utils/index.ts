import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { recordMap } from '@design-edito/tools/agnostic/objects/record-map'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isInEnum } from '@design-edito/tools/agnostic/objects/enums/is-in-enum'
import { Method } from '../method'
import { Transformer } from '../transformer'
import { Tree as TreeNamespace } from '../tree'
import { Types } from '../types'

export namespace Utils {
  export function clone<T extends Types.Tree.Value = Types.Tree.Value> (value: T): T {
    const { Element, Text, NodeList, document } = Window.get()
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null) return value
    if (value instanceof Text) return value.cloneNode(true) as T
    if (value instanceof NodeList) {
      const frag = document.createDocumentFragment()
      const nodes = Array.from(value).map(e => e.cloneNode(true) as Element | Text)
      frag.append(...nodes)
      return frag.childNodes as T
    }
    if (value instanceof Element) return value.cloneNode(true) as T
    if (value instanceof Transformer) return Transformer.clone(value) as T
    if (value instanceof Method) return Method.clone(value) as T
    if (Array.isArray(value)) return [...value.map(clone)] as T
    if (isRecord(value)) return recordMap(value, prop => clone(prop as Types.Tree.Value)) as T
    throw new Error(`Cannot clone value: ${value}`)
  }

  export function coalesceValues (
    currentValue: Types.Tree.RestingValue,
    subpath: string | number,
    subvalue: Types.Tree.Value): Types.Tree.RestingValue {
    const { Element, Text, NodeList, document } = Window.get()
    let actualSubvalue = subvalue

    // If actualSubvalue is a Transformer, apply it then continue the process
    if (actualSubvalue instanceof Transformer) {
      const transformer = actualSubvalue
      const transformationResult = transformer.apply(currentValue)
      if (!transformationResult.success) {
        console.warn({ ...transformationResult.error })
        return currentValue
      }
      const evaluated = transformationResult.payload
      if (transformer.mode === 'isolation') {
        actualSubvalue = evaluated // We set the actualSubvalue to the result of the evaluation, and process this result below as a non-Transformer value
      } else {
        return evaluated // If mode is coalescion, the reduced value is the output of the Transformer
      }
    }

    if (Array.isArray(currentValue)) return [...currentValue, actualSubvalue]
    if (currentValue === null) return actualSubvalue
    if (typeof currentValue === 'boolean') return actualSubvalue
    if (typeof currentValue === 'number') return actualSubvalue
    if (currentValue instanceof Transformer) return actualSubvalue
    if (currentValue instanceof Method) return actualSubvalue
    
    if (typeof currentValue === 'string') {
      if (actualSubvalue === null
        || typeof actualSubvalue === 'boolean'
        || typeof actualSubvalue === 'number'
        || typeof actualSubvalue === 'string'
      ) return `${currentValue}${actualSubvalue}`
      if (actualSubvalue instanceof Text) return `${currentValue}${actualSubvalue.textContent}`
      if (actualSubvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, Utils.clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, ...Utils.clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return actualSubvalue
    }
  
    if (currentValue instanceof Text) {
      if (actualSubvalue === null
        || typeof actualSubvalue === 'boolean'
        || typeof actualSubvalue === 'number'
        || typeof actualSubvalue === 'string'
      ) return document.createTextNode(`${currentValue.textContent}${actualSubvalue}`)
      if (actualSubvalue instanceof Text) return document.createTextNode(`${currentValue.textContent}${actualSubvalue.textContent}`)
      if (actualSubvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return actualSubvalue
    }
  
    if (currentValue instanceof Element) {
      if (actualSubvalue === null
        || typeof actualSubvalue === 'boolean'
        || typeof actualSubvalue === 'number'
        || typeof actualSubvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), `${actualSubvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof Text || actualSubvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return actualSubvalue
    }
  
    if (currentValue instanceof NodeList) {
      if (actualSubvalue === null
        || typeof actualSubvalue === 'boolean'
        || typeof actualSubvalue === 'number'
        || typeof actualSubvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), `${actualSubvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof Text || actualSubvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (actualSubvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), ...clone(actualSubvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return actualSubvalue
    }
    
    // current value is a record here
    if (typeof subpath === 'number') return { ...currentValue }
    return {
      ...currentValue,
      [subpath]: actualSubvalue
    }
  }

  export const toHyperJson = (value: Types.Tree.Value): Element | Text => {
    // [WIP] finish this
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
    if (Array.isArray(value)) {
      const elt = document.createElement('array')
      elt.append(...value.map(e => toHyperJson(e)))
      return elt
    }
    if (value instanceof Transformer) return clone(value.sourceTree.node)
    if (value instanceof Method) return clone(value.transformer.sourceTree.node)
    // Value is record
    const elt = document.createElement('record')
    Object.entries(value).forEach(([key, val]) => {
      const hjVal = toHyperJson(val)
      if (hjVal instanceof Text) return;
      hjVal.setAttribute(TreeNamespace.Tree.keyAttribute, key)
      elt.append(hjVal)
    })
    return elt
  }

  export namespace Transformations {
    export namespace TypeChecks {
      export function getType<T extends unknown> (value: T): T extends Types.Tree.Value
        ? Types.Tree.ValueTypeName
        : Types.Tree.ValueTypeName | undefined {
        if (singleTypeCheck(value, 'null')) return 'null'
        if (singleTypeCheck(value, 'boolean')) return 'boolean'
        if (singleTypeCheck(value, 'number')) return 'number'
        if (singleTypeCheck(value, 'string')) return 'string'
        if (singleTypeCheck(value, 'element')) return 'element'
        if (singleTypeCheck(value, 'text')) return 'text'
        if (singleTypeCheck(value, 'nodelist')) return 'nodelist'
        if (singleTypeCheck(value, 'method')) return 'method'
        if (singleTypeCheck(value, 'array')) return 'array'
        if (singleTypeCheck(value, 'record')) return 'record'
        return undefined as T extends Types.Tree.Value
          ? Types.Tree.ValueTypeName
          : Types.Tree.ValueTypeName | undefined
      }

      export const everyTypeName: Types.Tree.ValueTypeName[] = [
        'null', 'boolean', 'number', 'string', 'text',
        'nodelist', 'element', 'method', 'array',
        'record'
      ]

      export function singleTypeCheck<K extends Types.Tree.ValueTypeName> (
        value: unknown,
        type: K
      ): value is Types.Tree.ValueTypeFromNames<[K]> {
        const { Element, Text, NodeList } = Window.get()
        if (type === 'null' && value === null) return true
        if (type === 'boolean' && typeof value === 'boolean') return true
        if (type === 'number' && typeof value === 'number') return true
        if (type === 'string' && typeof value === 'string') return true
        if (type === 'element' && value instanceof Element) return true
        if (type === 'text' && value instanceof Text) return true
        if (type === 'nodelist' && value instanceof NodeList) {
          const children = Array.from(value)
          return children.every(child => child instanceof Element || child instanceof Text)
        }
        if (type === 'method' && value instanceof Method) return true
        if (type === 'array' && Array.isArray(value)) {
          const childrenOk = value.every(child => typeCheck(child, ...everyTypeName).success)
          return childrenOk
        }
        if (type === 'record' && isRecord(value)) {
          const childrenOk = Object.values(value).every(child => typeCheck(child, ...everyTypeName).success)
          return childrenOk
        }
        return false
      }
  
      export function typeCheck<K extends Array<Types.Tree.ValueTypeName>> (
        value: unknown,
        ...types: K
      ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>, { expected: string, found: string }> {
        const matchesOneType = types.some(type => singleTypeCheck(value, type))
        if (matchesOneType) return Outcome.makeSuccess(value as Types.Tree.ValueTypeFromNames<K>)
        return Outcome.makeFailure({
          expected: types.join(' | '),
          found: getType(value) ?? 'undefined'
        })
      }
    
      export function typeCheckMany<K extends Array<Types.Tree.ValueTypeName>> (
        values: unknown[],
        ...types: K
      ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>[], { position: number, expected: string, found: string }> {
        for (const [pos, val] of Object.entries(values)) {
          const checked = typeCheck(val, ...types)
          if (checked.success) continue
          return Outcome.makeFailure({ position: parseInt(pos), ...checked.error })
        }
        return Outcome.makeSuccess(values as Types.Tree.ValueTypeFromNames<K>[])
      }
    }
  }

  export namespace Tree {
    export function mergeNodes (nodes: Array<Element | Text>): Element | Text {
      const [first, ...rest] = nodes
      if (first === undefined) throw new Error('Expecting at least one node')
      const { Text, Element, document } = Window.get()
    
      /* Local utils function */
      const isTextOrElement = (node: Node): node is Text | Element => node instanceof Text || node instanceof Element
  
      /* Shallow merge nodes */
      let CURRENT: Element | Text = first
      rest.forEach(node => {
        if (node instanceof Text) {
          CURRENT.remove()
          CURRENT = node
          return;
        }
        const actionRaw = node.getAttribute(TreeNamespace.Tree.actionAttribute)
        const action = isInEnum(Types.Tree.Merge.Action, actionRaw as any)
          ? actionRaw as Types.Tree.Merge.Action
          : Types.Tree.Merge.Action.REPLACE
        if (action === Types.Tree.Merge.Action.REPLACE) {
          CURRENT.remove()
          CURRENT = node
          return;
        }
        if (CURRENT instanceof Text) {
          if (node instanceof Text) {
            const appended = action === Types.Tree.Merge.Action.APPEND
              ? document.createTextNode(`${CURRENT.textContent}${node.textContent}`)
              : document.createTextNode(`${node.textContent}${CURRENT.textContent}`)
            CURRENT.remove()
            node.remove()
            CURRENT = appended
            return;
          }
          CURRENT.remove()
          CURRENT = node
          return;
        }
        if (node instanceof Text) {
          CURRENT.remove()
          CURRENT = node
          return;
        }
        const currentAttributes = Array.from(CURRENT.attributes)
        const nodeAttributes = Array.from(node.attributes)
        const nodeChildren = Array.from(node.childNodes).filter(isTextOrElement)
        const outputAttributes = action === Types.Tree.Merge.Action.APPEND
          ? [...currentAttributes, ...nodeAttributes]
          : [...nodeAttributes, ...currentAttributes]
        if (action === Types.Tree.Merge.Action.APPEND) CURRENT.append(...nodeChildren)
        else CURRENT.prepend(...nodeChildren)
        outputAttributes.forEach(attr => (CURRENT as Element).setAttribute(attr.name, attr.value))
        node.remove()
        return;
      })
    
      /* List child nodes sharing the same subpath */
      const wrapperChildren = Array.from(CURRENT.childNodes).filter(isTextOrElement)
      const subpaths = new Map<string | number, Array<Element | Text>>()
      let positionnedChildrenCount = 0
      wrapperChildren.forEach(child => {
        if (child instanceof Text) {
          const childKey = positionnedChildrenCount
          const found = subpaths.get(childKey) ?? []
          found.push(child)
          subpaths.set(childKey, found)
          positionnedChildrenCount += 1
        } else {
          const rawChildKey = child.getAttribute(TreeNamespace.Tree.keyAttribute)
          const childKey = rawChildKey ?? positionnedChildrenCount
          const found = subpaths.get(childKey) ?? []
          found.push(child)
          subpaths.set(childKey, found)
          if (rawChildKey === null) { positionnedChildrenCount += 1 }
        }
      })
    
      /* For each node sharing a subpath, merge them */
      subpaths.forEach(nodes => {
        if (nodes.length < 2) return
        return mergeNodes(nodes)
      })
    
      /* At the end of the process, find and return wrapper's first child */
      return CURRENT
    }

    export function mergeRoots (nodes: Array<Element | Text>): Element | Text {
      const { Element } = Window.get()
      const elements = nodes.filter((e): e is Element => e instanceof Element)
      elements.forEach(element => {
        const elementAction = element.getAttribute(TreeNamespace.Tree.actionAttribute) ?? Types.Tree.Merge.Action.APPEND
        element.setAttribute(TreeNamespace.Tree.actionAttribute, elementAction)
      })
      const merged = mergeNodes(elements)
      return merged
    }

    export function getInitialValueFromTypeName (name: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>): Types.Tree.RestingValue {
      const { document } = Window.get()
      if (name === 'null') return null
      if (name === 'boolean') return false
      if (name === 'number') return 0
      if (name === 'string') return ''
      if (name === 'text') return document.createTextNode('')
      if (name === 'nodelist') return document.createDocumentFragment().childNodes as NodeListOf<Element | Text>
      if (name === 'element') return document.createElement('div')
      if (name === 'array') return []
      if (name === 'record') return {}
      throw new Error(`Unknown value type name: ${name}`)
    }

    export namespace TypeChecks {
      export function getType<T extends unknown> (value: T): T extends Types.Tree.Value
        ? Types.Tree.ValueTypeName
        : Types.Tree.ValueTypeName | undefined {
        if (singleTypeCheck(value, 'null')) return 'null'
        if (singleTypeCheck(value, 'boolean')) return 'boolean'
        if (singleTypeCheck(value, 'number')) return 'number'
        if (singleTypeCheck(value, 'string')) return 'string'
        if (singleTypeCheck(value, 'element')) return 'element'
        if (singleTypeCheck(value, 'text')) return 'text'
        if (singleTypeCheck(value, 'nodelist')) return 'nodelist'
        if (singleTypeCheck(value, 'transformer')) return 'transformer'
        if (singleTypeCheck(value, 'method')) return 'method'
        if (singleTypeCheck(value, 'array')) return 'array'
        if (singleTypeCheck(value, 'record')) return 'record'
        return undefined as T extends Types.Tree.Value
          ? Types.Tree.ValueTypeName
          : Types.Tree.ValueTypeName | undefined
      }

      export const everyTypeName: Types.Tree.ValueTypeName[] = [
        'null', 'boolean', 'number', 'string', 'text',
        'nodelist', 'element', 'transformer', 'method',
        'array', 'record'
      ]

      export function singleTypeCheck<K extends Types.Tree.ValueTypeName> (
        value: unknown,
        type: K
      ): value is Types.Tree.ValueTypeFromNames<[K]> {
        const { Element, Text, NodeList } = Window.get()
        if (type === 'null' && value === null) return true
        if (type === 'boolean' && typeof value === 'boolean') return true
        if (type === 'number' && typeof value === 'number') return true
        if (type === 'string' && typeof value === 'string') return true
        if (type === 'element' && value instanceof Element) return true
        if (type === 'text' && value instanceof Text) return true
        if (type === 'nodelist' && value instanceof NodeList) {
          const children = Array.from(value)
          return children.every(child => child instanceof Element || child instanceof Text)
        }
        if (type === 'transformer' && value instanceof Transformer) return true
        if (type === 'method' && value instanceof Method) return true
        if (type === 'array' && Array.isArray(value)) {
          const childrenOk = value.every(child => typeCheck(child, ...everyTypeName).success)
          return childrenOk
        }
        if (type === 'record' && isRecord(value)) {
          const childrenOk = Object.values(value).every(child => typeCheck(child, ...everyTypeName).success)
          return childrenOk
        }
        return false
      }
  
      export function typeCheck<K extends Array<Types.Tree.ValueTypeName>> (
        value: unknown,
        ...types: K
      ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>, { expected: string, found: string }> {
        const matchesOneType = types.some(type => singleTypeCheck(value, type))
        if (matchesOneType) return Outcome.makeSuccess(value as Types.Tree.ValueTypeFromNames<K>)
        return Outcome.makeFailure({
          expected: types.join(' | '),
          found: getType(value) ?? 'undefined'
        })
      }
    
      export function typeCheckMany<K extends Array<Types.Tree.ValueTypeName>> (
        values: unknown[],
        ...types: K
      ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>[], { position: number, expected: string, found: string }> {
        for (const [pos, val] of Object.entries(values)) {
          const checked = typeCheck(val, ...types)
          if (checked.success) continue
          return Outcome.makeFailure({ position: parseInt(pos), ...checked.error })
        }
        return Outcome.makeSuccess(values as Types.Tree.ValueTypeFromNames<K>[])
      }
  
      export const isTreeMode = (name: string): name is Types.Tree.Mode => name === 'isolation' || name === 'coalescion' 
  
      export const isValueTypeName = (name: string): name is Types.Tree.ValueTypeName => {
        const list: Types.Tree.ValueTypeName[] = [
          'null', 'boolean', 'number', 'string',
          'text', 'nodelist', 'element',
          'transformer', 'method',
          'array', 'record'
        ]
        return list.includes(name as any)
      }
    }
  }

  export namespace SmartTags {
    export const expectEmptyArgs = (args: unknown[]): Outcome.Either<[], {
      expected: string,
      found: string
    }> => {
      if (args.length === 0) return Outcome.makeSuccess([])
      return Outcome.makeFailure({
        expected: 'length: 0',
        found: `length: ${args.length}`
      })
    }

    export const makeMainValueError = (expected: string, found: string, details?: any) => ({ expected, found, details }) as Types.Transformations.FunctionMainValueFailure
    export const makeArgsValueError = (expected: string, found: string, position?: number, details?: any) => ({ expected, found, position, details }) as Types.Transformations.FunctionArgsValueFailure
    export const makeTransformationError = (details?: any) => ({ details }) as Types.Transformations.FunctionTransformationFailure
  }
}
