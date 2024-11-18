import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { isInEnum } from '@design-edito/tools/agnostic/objects/enums/is-in-enum'
import { Types } from '../types'
import { Utils } from '../utils'
import { Cast } from '../cast'

import { array } from '../smart-tags/isolated/array'
import { boolean } from '../smart-tags/isolated/boolean'
import { element } from '../smart-tags/isolated/element'
import { nodelist } from '../smart-tags/isolated/nodelist'
import { nullFunc } from '../smart-tags/isolated/null'
import { number } from '../smart-tags/isolated/number'
import { record } from '../smart-tags/isolated/record'
import { string } from '../smart-tags/isolated/string'
import { text } from '../smart-tags/isolated/text'

export const SMART_TAGS_REGISTER: Types.SmartTags.Register = new Map<string, Types.SmartTags.SmartTag<any, any, any>>([
  array,
  boolean,
  element,
  nodelist,
  nullFunc,
  number,
  record,
  string,
  text
])

export namespace Tree {
  export const actionAttribute = '_action'
  export const keyAttribute = '_key'
  export const methodAttribute = '_method'
  export const initAttribute = '_init'
  export const modeAttribute = '_mode'

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
      const actionRaw = node.getAttribute(actionAttribute)
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
        const rawChildKey = child.getAttribute(keyAttribute)
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
      const elementAction = element.getAttribute(actionAttribute) ?? Types.Tree.Merge.Action.APPEND
      element.setAttribute(actionAttribute, elementAction)
    })
    const merged = mergeNodes(elements)
    return merged
  }

  export function from (nodes: Array<Element | Text>): Tree {
    const merged = mergeRoots(nodes)
    return new Tree(merged, null, null)
  }

  export function getInitialValueFromTypeName (name: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>): Types.Tree.Value {
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

  export class Tree {
    readonly node: Element | Text
    readonly parent: Tree | null
    readonly pathFromParent: string | number | null
    readonly root: Tree
    readonly isRoot: boolean
    readonly path: Array<string | number>
    readonly pathString: string
    readonly attributes: ReadonlyArray<Readonly<Attr>> | null
    readonly tagName: string | null
    readonly smartTagName: string | null
    readonly smartTagData: Types.SmartTags.SmartTag | null
    readonly mode: Types.Tree.Mode
    readonly isMethod: boolean
    readonly isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()

    constructor (
      node: Element | Text,
      parent: null,
      pathFromParent: null)
    constructor (
      node: Element | Text,
      parent: Tree,
      pathFromParent: string | number)
    constructor (
      node: Element | Text,
      parent: Tree | null,
      pathFromParent: string | number | null) {
      const { Element, Text } = Window.get()

      // Bounds
      this.evaluateSilently = this.evaluateSilently.bind(this) // [WIP] use a Logger in the options and log directly from evaluate() ?
      this.evaluate = this.evaluate.bind(this)
      this.printPerfCounters = this.printPerfCounters.bind(this)
      
      // node
      this.node = node

      // parent, pathFromParent, root, isRoot
      if (parent !== null && pathFromParent !== null) {
        this.isRoot = false
        this.parent = parent
        this.pathFromParent = pathFromParent
        this.root = this.parent.root
      } else {
        this.isRoot = true
        this.parent = null
        this.pathFromParent = null
        this.root = this
      }

      // path, pathString
      this.path = this.isRoot ? [] : [...this.parent!.path, this.pathFromParent!]
      this.pathString = `/${this.path.join('/')}`

      // attributes
      this.attributes = node instanceof Element
        ? Array.from(node.attributes)
        : null

      // isMethod, tagName, smartTagName
      if (node instanceof Element) {
        const rawTagName = node.tagName.trim().toLowerCase()
        const hasTrailingUnderscore = rawTagName.endsWith('_')
        const hasMethodAttribute = this.attributes?.find(attr => attr.name === methodAttribute) !== undefined
        const isMethod = hasTrailingUnderscore || hasMethodAttribute
        this.isMethod = isMethod
        this.tagName = rawTagName
        this.smartTagName = hasTrailingUnderscore 
          ? rawTagName.replace(/_+$/g, '')
          : rawTagName
      } else {
        this.isMethod = false
        this.tagName = null
        this.smartTagName = null
      }

      // smartTagData
      if (this.smartTagName === null) { this.smartTagData = null }
      else { this.smartTagData = SMART_TAGS_REGISTER.get(this.smartTagName) ?? null }

      // mode
      // [WIP] rootNode cannot be in coalescion mode
      const hasModeAttribute = this.attributes?.find(attr => {
        return attr.name === modeAttribute
          && Utils.TypeChecks.isTreeMode(attr.value)
      })
      this.mode = (hasModeAttribute?.value as Types.Tree.Mode | undefined)
        ?? this.smartTagData?.defaultMode
        ?? 'isolation'

      // isolationInitType
      const hasInitAttribute = this.attributes?.find(attr => {
        if (attr.name !== initAttribute) return false
        const val = attr.value.trim().toLowerCase()
        if (!Utils.TypeChecks.isValueTypeName(val)) return false
        if (val === 'transformer') return false
        if (val === 'method') return false
        return true
      })
      if (this.mode === 'coalescion') { this.isolationInitType = 'array' }
      else {
        const initAttributeValue = hasInitAttribute?.value as Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'> | undefined
        if (initAttributeValue !== undefined) { this.isolationInitType = initAttributeValue }
        else if (this.smartTagData !== undefined) { this.isolationInitType = this.smartTagData?.isolationInitType ?? 'array' }
        else { this.isolationInitType = 'nodelist' }
      }

      // subtrees
      const { childNodes } = node
      let positionnedChildrenCount = 0
      const mutableSubtrees = new Map<string | number, Tree>()
      Array
        .from(childNodes)
        .filter((node, _, nodes): node is Element | Text => {
          if (node instanceof Element) return true
          if (!(node instanceof Text)) return false
          const hasContent = (node.textContent ?? '').trim() !== ''
          if (hasContent) return true
          if (nodes.some(n => n instanceof Element)) return false
          if (nodes.some(n => n instanceof Text && (n.textContent ?? '') !== '')) return false
          return true
        })
        .forEach(childNode => {
          if (childNode instanceof Text) {
            childNode.textContent = childNode.textContent?.trim() ?? ''
            mutableSubtrees.set(
              positionnedChildrenCount,
              new Tree(childNode, this, positionnedChildrenCount)
            )
            positionnedChildrenCount += 1
          } else {
            const propertyName = childNode.getAttribute(keyAttribute)
            if (propertyName === null) {
              mutableSubtrees.set(
                positionnedChildrenCount,
                new Tree(childNode, this, positionnedChildrenCount)
              )
              positionnedChildrenCount += 1
            } else {
              mutableSubtrees.set(
                propertyName,
                new Tree(childNode, this, propertyName)
              )
            }
          }
        })
      this.subtrees = mutableSubtrees
    }

    evaluateSilently (): Types.Tree.Value {
      const { isolationInitType, subtrees, node, smartTagData, isMethod, isRoot, mode } = this
      const { Text } = Window.get()

      // Checks for impossible configurations
      if (node instanceof Text || smartTagData === null) {
        if (isMethod) throw new Error('A Text or HTMLElement node cannot be used as a method')
        if (mode === 'coalescion') throw new Error('A Text or HTMLElement node cannot be used in coalescion mode')
      }

      // If node is text, returns the node itself
      if (node instanceof Text) return node.cloneNode(true) as Text

      const initialInnerValue = getInitialValueFromTypeName(isolationInitType)
      console.log('INIT-TYPE=', isolationInitType)
      console.log('INITIAL=', initialInnerValue)
      const innerValue = Array
        .from(subtrees)
        .reduce((reduced, [subpath, subtree]) => Utils.coalesceValues(reduced, subpath, subtree.evaluate()), initialInnerValue)

      // If node is Text node, return a Text value
      console.log('INNER=', innerValue)
      if (node instanceof Text) return Cast.toText(innerValue)
    
      // If no smartTagData, then treat it as an HTMLElement
      if (smartTagData === null) {
        const nodelist = Cast.toNodeList(innerValue)
        const clone = Utils.clone(node)
        clone.append(...nodelist)
        return clone
      }
    
      // If node is a SmartTag
      const { transformer, method } = smartTagData.generator(innerValue, mode, this)
      if (isMethod) return method
      if (mode === 'isolation') {
        const applied = transformer.apply(null) // Here we apply null as a placeholder outerValue since the transformer is in isolation mode
        if (applied.success) return applied.payload
        throw {
          error: 'Transformation error',
          details: applied.error,
          transformer: transformer.name,
          path: this.pathString,
        }
      }
      if (isRoot) throw new Error(`The root node cannot be used in coalescion mode`)
      return transformer
    }

    evaluate () {
      const { smartTagName, tagName, pathString } = this
      console.group(smartTagName ?? tagName ?? '#text', pathString)
      const evaluated = this.evaluateSilently()
      // console.log('EVALUATED=', evaluated)
      console.groupEnd()
      return evaluated
    }

    printPerfCounters () {
      console.log('[WIP] PRINT PERF COUNTERS')
    }
  }  
}
