import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'

import { Types } from '../types'
import { Utils } from '../utils'
import { Cast } from '../cast'

import { array } from '../smart-tags/isolated/array'
import { boolean } from '../smart-tags/isolated/boolean'
import { element } from '../smart-tags/isolated/element'
import { global } from '../smart-tags/isolated/global'
import { nodelist } from '../smart-tags/isolated/nodelist'
import { nullFunc } from '../smart-tags/isolated/null'
import { number } from '../smart-tags/isolated/number'
import { record } from '../smart-tags/isolated/record'
import { ref } from '../smart-tags/isolated/ref'
import { string } from '../smart-tags/isolated/string'
import { text } from '../smart-tags/isolated/text'

import { add } from '../smart-tags/coalesced/add'
import { addclass } from '../smart-tags/coalesced/addclass'
import { and } from '../smart-tags/coalesced/and'
import { append } from '../smart-tags/coalesced/append'
import { at } from '../smart-tags/coalesced/at'
import { call } from '../smart-tags/coalesced/call'
import { clone } from '../smart-tags/coalesced/clone'
import { deleteproperties } from '../smart-tags/coalesced/deleteproperties'
import { equals } from '../smart-tags/coalesced/equals'
import { getproperties } from '../smart-tags/coalesced/getproperties'
import { getproperty } from '../smart-tags/coalesced/getproperty'
import { ifFunc } from '../smart-tags/coalesced/if'
import { join } from '../smart-tags/coalesced/join'
import { length } from '../smart-tags/coalesced/length'
import { map } from '../smart-tags/coalesced/map'
import { negate } from '../smart-tags/coalesced/negate'
import { notrailing } from '../smart-tags/coalesced/notrailing'
import { or } from '../smart-tags/coalesced/or'
import { print } from '../smart-tags/coalesced/print'
import { push } from '../smart-tags/coalesced/push'
import { recordtoarray } from '../smart-tags/coalesced/recordtoarray'
import { removeclass } from '../smart-tags/coalesced/removeclass'
import { replace } from '../smart-tags/coalesced/replace'
import { select } from '../smart-tags/coalesced/select'
import { setproperty } from '../smart-tags/coalesced/setproperty'
import { sorton } from '../smart-tags/coalesced/sorton'
import { split } from '../smart-tags/coalesced/split'
import { toarray } from '../smart-tags/coalesced/toarray'
import { toboolean } from '../smart-tags/coalesced/toboolean'
import { toelement } from '../smart-tags/coalesced/toelement'
import { toggleclass } from '../smart-tags/coalesced/toggleclass'
import { tonodelist } from '../smart-tags/coalesced/tonodelist'
import { tonull } from '../smart-tags/coalesced/tonull'
import { tonumber } from '../smart-tags/coalesced/tonumber'
import { torecord } from '../smart-tags/coalesced/torecord'
import { toref } from '../smart-tags/coalesced/toref'
import { tostring } from '../smart-tags/coalesced/tostring'
import { totext } from '../smart-tags/coalesced/totext'
import { transformselected } from '../smart-tags/coalesced/transformselected'
import { trim } from '../smart-tags/coalesced/trim'

// [WIP] find a better place for this
export const SMART_TAGS_REGISTER: Types.SmartTags.Register = new Map<string, Types.SmartTags.SmartTag<any, any, any>>([
  add, array, boolean, element, global, nodelist, nullFunc, number, record, ref, string, text, addclass,
  and, append, at, call, clone, deleteproperties, equals, getproperties, getproperty, ifFunc, join,
  length, map, negate, notrailing, or, print, push, recordtoarray, removeclass, replace, select,
  setproperty, sorton, split, toarray, toboolean, toelement, toggleclass, tonodelist, tonull, tonumber,
  toref, torecord, tostring, totext, transformselected, trim
])

// [WIP] eventually just export the Tree class here
export namespace Tree {
  export class Tree {
    readonly node: Element | Text
    readonly options: Types.Tree.Options
    readonly parent: Tree | null
    readonly parents: Tree[]
    readonly pathFromParent: string | number | null
    readonly root: Tree
    readonly isRoot: boolean
    readonly path: Array<string | number>
    readonly pathString: string
    readonly attributes: ReadonlyArray<Readonly<Attr>> | null
    readonly isMethod: boolean
    readonly tagName: string | null
    readonly smartTagName: string | null
    readonly smartTagData: Types.SmartTags.SmartTag | null
    readonly mode: Types.Tree.Mode
    readonly isPreserved: boolean
    readonly isLiteral: boolean
    readonly isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()

    static actionAttribute = '_action'
    static keyAttribute = '_key'
    static methodAttribute = '_method'
    static initAttribute = '_init'
    static modeAttribute = '_mode'
    static preserveAttribute = '_preserve'
    static literalAttribute = '_literal'

    static defaultOptions: Types.Tree.Options = {
      globalObject: {}
    }

    static from (
      nodes: Array<Element | Text>,
      options: Types.Tree.Options): Tree {
      const merged = Utils.Tree.mergeRoots(nodes)
      return new Tree(merged, null, null, options)
    }

    constructor (
      node: Element | Text,
      parent: null,
      pathFromParent: null,
      options?: Types.Tree.Options)
    constructor (
      node: Element | Text,
      parent: Tree,
      pathFromParent: string | number,
      options?: Types.Tree.Options)
    constructor (
      node: Element | Text,
      parent: Tree | null,
      pathFromParent: string | number | null,
      options?: Types.Tree.Options) {
      const { Element, Text } = Window.get()

      // Bounds
      this.resolve = this.resolve.bind(this)
      this.evaluateAsValue = this.evaluateAsValue.bind(this) // [WIP] use a Logger in the options and log directly from evaluate() ?
      this.evaluate = this.evaluate.bind(this)
      this.printPerfCounters = this.printPerfCounters.bind(this)
      
      // node
      this.node = node

      // options
      this.options = options ?? Tree.defaultOptions

      // parent, parents, pathFromParent, root, isRoot
      if (parent !== null && pathFromParent !== null) {
        this.isRoot = false
        this.parent = parent
        this.parents = [parent, ...parent.parents]
        this.pathFromParent = pathFromParent
        this.root = this.parent.root
      } else {
        this.isRoot = true
        this.parent = null
        this.parents = []
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
        const hasMethodAttribute = this.attributes?.find(attr => attr.name === Tree.methodAttribute) !== undefined
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
        return attr.name === Tree.modeAttribute
          && Utils.Tree.TypeChecks.isTreeMode(attr.value)
      })
      this.mode = (hasModeAttribute?.value as Types.Tree.Mode | undefined)
        ?? this.smartTagData?.defaultMode
        ?? 'isolation'

      // isLiteral, isPreserved
      const hasLiteralAttribute = this.attributes?.find(attr => attr.name === Tree.literalAttribute) !== undefined
      this.isLiteral = hasLiteralAttribute
      const hasPreservedAttribute = this.attributes?.find(attr => attr.name === Tree.preserveAttribute) !== undefined
      this.isPreserved = hasPreservedAttribute

      // isolationInitType
      const hasInitAttribute = this.attributes?.find(attr => {
        if (attr.name !== Tree.initAttribute) return false
        const val = attr.value.trim().toLowerCase()
        if (!Utils.Tree.TypeChecks.isValueTypeName(val)) return false
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
        .filter((child, _, childNodes): child is Element | Text => {
          if (child instanceof Element) return true
          if (!(child instanceof Text)) return false
          const hasContent = (child.textContent ?? '').trim() !== ''
          if (hasContent) return true
          if (childNodes.some(n => n instanceof Element)) return false
          return true
        })
        .forEach(childNode => {
          if (childNode instanceof Text) {
            const hasContent = (childNode.textContent ?? '').trim() !== ''
            if (hasContent) { childNode.textContent = childNode.textContent?.trim() ?? '' }
            mutableSubtrees.set(
              positionnedChildrenCount,
              new Tree(childNode, this, positionnedChildrenCount, this.options)
            )
            positionnedChildrenCount += 1
          } else {
            const propertyName = childNode.getAttribute(Tree.keyAttribute)
            if (propertyName === null) {
              mutableSubtrees.set(
                positionnedChildrenCount,
                new Tree(childNode, this, positionnedChildrenCount, this.options)
              )
              positionnedChildrenCount += 1
            } else {
              mutableSubtrees.set(
                propertyName,
                new Tree(childNode, this, propertyName, this.options)
              )
            }
          }
        })
      this.subtrees = mutableSubtrees
    }

    resolve: Types.Tree.Resolver = function (this: Tree, path): Tree | undefined {
      let currentTree: Tree = this
      for (const chunk of path) {
        if (chunk === '.') continue
        if (chunk === '..') {
          currentTree = this.parent ?? this
          continue
        }
        const { subtrees } = currentTree
        const foundSubtree = subtrees.get(chunk)
        if (foundSubtree === undefined) return undefined
        currentTree = foundSubtree
      }
      return currentTree
    }

    evaluateAsValue (): Types.Tree.Value {
      const { isolationInitType, subtrees, node, smartTagData, isMethod, isRoot, mode } = this
      const { Text } = Window.get()

      // Checks for impossible configurations
      if (node instanceof Text || smartTagData === null) {
        if (isMethod) throw new Error('A Text or HTMLElement node cannot be used as a method')
        if (mode === 'coalescion') throw new Error('A Text or HTMLElement node cannot be used in coalescion mode')
      }

      // If node is text, returns the node itself
      if (node instanceof Text) return node.cloneNode(true) as Text

      const initialInnerValue = Utils.Tree.getInitialValueFromTypeName(isolationInitType)
      console.log('INIT-TYPE=', isolationInitType)
      console.log('INITIAL=', initialInnerValue)
      console.log('SUBTREES=', subtrees)
      const innerValue = Array
        .from(subtrees)
        .reduce((reduced, [subpath, subtree]) => {
          const coalesced = Utils.coalesceValues(reduced, subpath, subtree.evaluate())
          console.log('COALESCED=', coalesced)
          return coalesced
        }, initialInnerValue)
      console.log('INNER=', innerValue)

      // If no smartTagData, then treat it as an HTMLElement
      if (smartTagData === null) {
        const nodelist = Cast.toNodeList(innerValue)
        const clone = node.cloneNode() as Element
        clone.append(...nodelist)
        return clone
      }

      // If node is a SmartTag
      const { transformer, method } = smartTagData.generator(innerValue, mode, this)
      if (isMethod) return method
      if (mode === 'isolation') {
        // Here we apply null as a placeholder outerValue since the transformer is in isolation mode
        const applied = transformer.apply(null)
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
      const { smartTagName, tagName, pathString, isLiteral, isPreserved, attributes, node } = this
      const { Element } = Window.get()
      console.group(smartTagName ?? tagName ?? '#text', '@', pathString)
      if (isPreserved) return Utils.clone(node)
      const evaluated = this.evaluateAsValue()
      if (!isLiteral) {
        console.log('EVALUATED=', evaluated)
        console.groupEnd()
        return evaluated
      } else {
        const asLiteral = Utils.toHyperJson(evaluated)
        if (asLiteral instanceof Element) attributes?.forEach(({ name, value }) => asLiteral.setAttribute(name, value))
        console.log('EVALUATED=', asLiteral)
        console.groupEnd()
        return asLiteral
      }
    }

    printPerfCounters () {
      console.log('[WIP] PRINT PERF COUNTERS')
    }
  }  
}
