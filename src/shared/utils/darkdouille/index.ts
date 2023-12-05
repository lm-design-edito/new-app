/* Cast transformers */
import toString from './transformers/toString'
import toNumber from './transformers/toNumber'
import toBoolean from './transformers/toBoolean'
import toNull from './transformers/toNull'
import toHtml from './transformers/toHtml'
import toRef from './transformers/toRef'
import toArray from './transformers/toArray'
import toRecord from './transformers/toRecord'
/* Number transformers */
import add from './transformers/add'
import subtract from './transformers/subtract'
import multiply from './transformers/multiply'
import pow from './transformers/pow'
import divide from './transformers/divide'
import max from './transformers/max'
import min from './transformers/min'
import clamp from './transformers/clamp'
import greater from './transformers/greater'
import smaller from './transformers/smaller'
import equals from './transformers/equals'
/* String transformers */
import append from './transformers/append'
import prepend from './transformers/prepend'
import replace from './transformers/replace'
import trim from './transformers/trim'
import split from './transformers/split'
/* Array transformers */
import join from './transformers/join'
import at from './transformers/at'
import map from './transformers/map'
import push from './transformers/push'
/* Utility transformers */
import that from './transformers/this'
import clone from './transformers/clone'
import print from './transformers/print'
import { set, get } from './transformers/variables'
import cond from './transformers/cond'
import loop from './transformers/loop'

export namespace Darkdouille {
  export type TreeConstructorOptions = { node: Node, parent: Tree | undefined }
  export type TreeResolver = (path: string) => Tree | undefined
  export type Transformer<T extends TreeValue = TreeValue> = (input: TreeValue) => T
  export type TransformerFunctionGenerator<T extends TreeValue = TreeValue> = (...args: (TreeValue | Transformer)[]) => Transformer<T>
  export type TreePrimitiveValue = string | number | boolean | null | undefined | NodeListOf<Node>
  export type TreeValue = TreePrimitiveValue | TreeValue[] | { [key: string]: TreeValue }

  export class Tree {
    node: Node
    parent: Tree | undefined
    constructor (options: TreeConstructorOptions) {
      this.node = options.node
      this.parent = options.parent
      this.getNodeLocalPath = this.getNodeLocalPath.bind(this)
      this.getFunctionElementRawArgs = this.getFunctionElementRawArgs.bind(this)
      this.resolve = this.resolve.bind(this)
      this.getGeneratorFromFunctionName = this.getGeneratorFromFunctionName.bind(this)
      this.getGeneratorFromFunctionElement = this.getGeneratorFromFunctionElement.bind(this)
      this.resolveFunctionRawArgs = this.resolveFunctionRawArgs.bind(this)
      this.getTransformerFromTypeName = this.getTransformerFromTypeName.bind(this)
    }

    get shortName (): string {
      const { node } = this
      if (node instanceof Text) return `#text : ${node.textContent}`
      if (!(node instanceof Element)) return 'INVALID NODE TYPE'
      const clone = node.cloneNode() as Element
      return clone.outerHTML
    }

    get kind () {
      return getNodeKind(this.node)
    }

    get forceSelfWrap () {
      const { node } = this
      if (!(node instanceof Element)) return false
      const wrappAttr = node.getAttribute('wrap')
      if (wrappAttr === null) return false
      return true
    }

    get forceSelfNowrap () {
      const { node } = this
      if (!(node instanceof Element)) return false
      const wrappAttr = node.getAttribute('nowrap')
      if (wrappAttr === null) return false
      return true
    }

    get children () {
      const { node } = this
      if (node.nodeType !== Node.ELEMENT_NODE) return { values: [], transformers: [] }
      const element = node as Element
      const { childNodes } = element
      return [...childNodes].reduce((reduced, childNode) => {
        const isTransformer = isTransformerElement(childNode)
        const isFunction = isFunctionElement(childNode)
        const { transformers, values } = reduced
        if (isTransformer || isFunction) return { ...reduced, transformers: [...transformers, childNode] }
        return { ...reduced, values: [...values, childNode] }
      },
      { values: [] as Node[], transformers: [] as Node[] })
    }

    get form () {
      const { children: { values }, kind } = this
      let hasNamed = false
      let hasPositionned = false
      let hasElements = false
      let hasText = false
      values.forEach(node => {
        const kind = getNodeKind(node)
        if (kind === 'named') { hasNamed = true }
        if (kind === 'positionned') { hasPositionned = true }
        if (kind === 'element') { hasElements = true }
        if (kind === 'text') { hasText = true }
      })
      return { hasNamed, hasPositionned, hasElements, hasText }
    }

    get raw (): { [key: string]: Node } | Node[] | string | undefined {
      const { node, kind, form, children: { values } } = this
      if (kind === 'text') return node.textContent ?? undefined
      if (kind === 'positionned' || kind === 'named' || kind === 'element') {
        // Value is named or positionned and has named children
        if (kind !== 'element' && form.hasNamed) {
          let positionnedCnt = 0
          return values.reduce((reduced, node) => {
            const isNotElement = !(node instanceof Element)
            const isText = node instanceof Text
            if (isText && (node.textContent ?? '').trim() === '') return reduced
            positionnedCnt ++
            if (isText) return { ...reduced, [`${positionnedCnt - 1}`]: node }
            if (isNotElement) return reduced
            const classAttr = node.getAttribute('class')
            if (classAttr === null || classAttr === '') return { ...reduced, [`${positionnedCnt - 1}`]: node }
            return { ...reduced, [classAttr]: node }
          }, {} as { [key: string]: Node })

        // Value has no named children
        } else {
          // If it contains positionned or element children, empty text elements are ignored
          const hasOnlyText = !form.hasPositionned && !form.hasElements
          return values.map(node => {
            const nodeKind = getNodeKind(node)
            if (!hasOnlyText && nodeKind === 'text' && (node.textContent ?? '').trim() === '') return undefined
            if (nodeKind === 'element'
              || nodeKind === 'named'
              || nodeKind === 'positionned'
              || nodeKind === 'text') return node
            return undefined
          }).filter((e): e is Node => e instanceof Node)
        }
      }
      return undefined
    }

    getNodeLocalPath (this: Tree, node: Node) {
      const { raw } = this
      if (raw === undefined) return undefined
      if (typeof raw === 'string') return undefined
      if (Array.isArray(raw)) {
        const foundIndex = raw.indexOf(node)
        if (foundIndex === -1) return undefined
        return `${foundIndex}`
      }
      return Object.keys(raw).find(key => raw[key] === node)
    }

    get subtrees (): { [key: string]: Tree } | Tree[] | string | undefined {
      const { raw } = this
      if (raw === undefined) return undefined
      if (typeof raw === 'string') return raw
      if (Array.isArray(raw)) return raw.map(node => new Tree({ node, parent: this }))
      return Object.keys(raw).reduce((reduced, key) => {
        const node = raw[key]
        if (node === undefined) return reduced
        return { ...reduced, [key]: new Tree({ node, parent: this }) }
      }, {} as { [key: string]: Tree })
    }

    get pretransformed (): TreeValue {
      const { kind, form, subtrees } = this
      if (subtrees === undefined) return undefined
      if (typeof subtrees === 'string') return subtrees
      
      // Element Tree
      if (kind === 'element') {
        // element + has named       => chaque item devient text ou NodeList, et poussés dans le NodeList de value. Named et Positionned peuvent-être wrapped, elements MUST be wrapped
        // element + has elements    => chaque item devient text ou NodeList, et poussés dans le NodeList de value. Named et Positionned peuvent-être wrapped, elements MUST be wrapped
        // element + has positionned => chaque item devient text ou NodeList, et poussés dans le NodeList de value. Named et Positionned peuvent-être wrapped, elements MUST be wrapped
        // element + has text        => chaque item devient text ou NodeList, et poussés dans le NodeList de value. Named et Positionned peuvent-être wrapped, elements MUST be wrapped
        const fragment = document.createDocumentFragment()
        if (Array.isArray(subtrees)) {
          subtrees.forEach(subtree => {
            if (subtree.kind === 'element') {
              const wrapper = subtree.node.cloneNode()
              if (!(wrapper instanceof Element)) return;
              wrapper.append(...toHtml()(subtree.value))
              fragment.append(wrapper)
            } else if (subtree.kind === 'named' || subtree.kind === 'positionned') {
              let shouldWrap = true
              if (subtree.forceSelfNowrap === true) shouldWrap = false
              if (shouldWrap) {
                const { wrapped } = subtree
                if (wrapped !== undefined) fragment.append(wrapped)
              } else {
                fragment.append(...toHtml()(subtree.value))
              }
            } else if (subtree.kind === 'text') {
              fragment.append(document.createTextNode(toString()(subtree.value)))
            }
          })
        }
        return fragment.childNodes
      
      // Value Tree
      } else if (kind === 'named' || kind === 'positionned') {
        // value   + has named       => chaque item est poussé dans un {}, elements MUST be wrapped, pas named & positionned
        // value   + has elements    => chaque item devient text ou NodeList, et poussés dans le NodeList de value. Named et Positionned peuvent-être wrapped, elements MUST be wrapped
        // value   + has positionned => chaque item est poussé dans un [], elements MUST be wrapped, pas named & positionned
        // value   + has text        => toutes les valeurs sont textifiées et jointes dans une seule valeur
        if (form.hasNamed) {
          if (Array.isArray(subtrees)) return {}
          return Object.keys(subtrees).reduce((reduced, key) => {
            const subtree = subtrees[key]
            if (subtree === undefined) return reduced
            if (subtree.kind === 'element') {
              const fragment = document.createDocumentFragment()
              const wrapper = subtree.node.cloneNode()
              if (!(wrapper instanceof Element)) return reduced
              wrapper.append(...toHtml()(subtree.value))
              fragment.append(wrapper)
              return { ...reduced, [key]: fragment.childNodes }
            }
            if (subtree.kind === 'named' || subtree.kind === 'positionned') {
              const shouldWrap = subtree.forceSelfWrap && !subtree.forceSelfNowrap
              if (shouldWrap) {
                const fragment = document.createDocumentFragment()
                const { wrapped } = subtree
                if (wrapped !== undefined) fragment.append(wrapped)
              } else {
                return { ...reduced, [key]: subtree.value }
              }
            }
            if (subtree.kind === 'text') return { ...reduced, [key]: subtree.value }
            return reduced
          }, {} as { [key: string]: TreeValue })
        
        } else if (form.hasElements) {
          const fragment = document.createDocumentFragment()
          if (Array.isArray(subtrees)) {
            subtrees.forEach(subtree => {
              if (subtree.kind === 'element') {
                const wrapper = subtree.node.cloneNode()
                if (!(wrapper instanceof Element)) return;
                wrapper.append(...toHtml()(subtree.value))
                fragment.append(wrapper)
              } else if (subtree.kind === 'named' || subtree.kind === 'positionned') {
                let shouldWrap = true
                if (subtree.forceSelfNowrap === true) shouldWrap = false
                if (shouldWrap) {
                  const { wrapped } = subtree
                  if (wrapped !== undefined) fragment.append(wrapped)
                } else {
                  fragment.append(...toHtml()(subtree.value)) // [WIP] or wrapped
                }
              } else if (subtree.kind === 'text') {
                fragment.append(document.createTextNode(toString()(subtree.value)))
              }
            })
          }
          return fragment.childNodes

        } else if (form.hasPositionned) {
          if (!Array.isArray(subtrees)) return []
          return subtrees.map(subtree => {
            if (subtree.kind === 'element') {
              const wrapper = subtree.node.cloneNode()
              if (!(wrapper instanceof Element)) return new Error();
              wrapper.append(...toHtml()(subtree.value))
              const fragment = document.createDocumentFragment()
              fragment.append(wrapper)
              return fragment.childNodes
            } else if (subtree.kind === 'named' || subtree.kind === 'positionned') {
              const shouldWrap = subtree.forceSelfWrap && !subtree.forceSelfNowrap
              if (shouldWrap) {
                const fragment = document.createDocumentFragment()
                const { wrapped } = subtree
                if (wrapped !== undefined) fragment.append(wrapped)
                return fragment.childNodes
              } else {
                return subtree.value
              }
            } else if (subtree.kind === 'text') {
              return subtree.value
            }
            return subtree.value
          }).filter((e): e is TreeValue => !(e instanceof Error))          
        
        } else if (form.hasText) {
          if (!Array.isArray(subtrees)) return []
          // [WIP] we know here that there is only text but this part should pretend it doesnt know
          return subtrees.map(subtree => toString()(subtree.value)).join('')
        
        } else {
          if (!Array.isArray(subtrees)) return []
          // [WIP] we know here that there is only text but this part should pretend it doesnt know
          return subtrees.map(subtree => toString()(subtree.value)).join('')
        }
      }

      return undefined
    }

    get parents (): Tree[] {
      const { parent } = this
      let currentTree = parent
      const parents: Tree[] = []
      while (true) {
        if (currentTree === undefined) break;
        parents.push(currentTree)
        currentTree = currentTree.parent
      }
      return parents
    }

    get pathFromParent (): string | undefined {
      const { node, parent } = this
      if (parent === undefined) return undefined
      return parent.getNodeLocalPath(node)
    }

    get path (): string | undefined {
      const { parents } = this
      return parents.reduce((path, parent) => {
        const parentPath = parent.pathFromParent
        if (parentPath === undefined) return `/${path}`
        return `${parent.pathFromParent}/${path}`
      }, this.pathFromParent)
    }

    get root (): Tree {
      const { parents } = this
      const lastParent = parents[parents.length - 1]
      if (lastParent === undefined) return this
      return lastParent
    }

    resolve: TreeResolver = function (this: Tree, path: string) {
      const pathChunks = path.split('/').filter(e => e.trim() !== '')
      const startFromRoot = path[0] === '/'
      const startTree = startFromRoot ? this.root : this
      return pathChunks.reduce((prevTree, pathChunk) => {
        if (prevTree === undefined) return undefined
        if (pathChunk === '.') return prevTree
        if (pathChunk === '..') return prevTree.parent
        const { subtrees } = prevTree
        if (subtrees === undefined) return undefined
        if (typeof subtrees === 'string') return undefined
        if (Array.isArray(subtrees)) {
          const pos = parseInt(pathChunk)
          const subtree = subtrees[pos]
          if (typeof subtree === 'string' || subtree === undefined) return undefined
          return subtree
        }
        return subtrees[pathChunk]
      }, startTree as Tree | undefined)
    }

    getFunctionElementRawArgs (this: Tree, functionElement: Element): Element[] {
      const { childNodes } = functionElement
      return [...childNodes].filter((node): node is Element => node instanceof Element)
    }

    getGeneratorFromFunctionName (this: Tree, name: FunctionName): TransformerFunctionGenerator {
      /* Cast */
      if (name === FunctionName.TOSTRING) return toString
      if (name === FunctionName.TONUMBER) return toNumber
      if (name === FunctionName.TOBOOLEAN) return toBoolean
      if (name === FunctionName.TONULL) return toNull
      if (name === FunctionName.TOHTML) return toHtml
      if (name === FunctionName.TOREF) return toRef(this.resolve.bind(this))
      if (name === FunctionName.TOARRAY) return toArray
      if (name === FunctionName.TORECORD) return toRecord
      
      /* Numbers */
      if (name === FunctionName.ADD) return add
      if (name === FunctionName.SUBTRACT) return subtract
      if (name === FunctionName.MULTIPLY) return multiply
      if (name === FunctionName.DIVIDE) return divide
      if (name === FunctionName.POW) return pow
      if (name === FunctionName.MAX) return max
      if (name === FunctionName.MIN) return min
      if (name === FunctionName.CLAMP) return clamp
      if (name === FunctionName.GREATER) return greater
      if (name === FunctionName.SMALLER) return smaller
      if (name === FunctionName.EQUALS) return equals

      /* Strings */
      if (name === FunctionName.APPEND) return append
      if (name === FunctionName.PREPEND) return prepend
      if (name === FunctionName.REPLACE) return replace
      if (name === FunctionName.TRIM) return trim
      if (name === FunctionName.SPLIT) return split
      
      /* Arrays */
      if (name === FunctionName.JOIN) return join
      if (name === FunctionName.AT) return at
      if (name === FunctionName.MAP) return map
      if (name === FunctionName.PUSH) return push

      /* Utils */
      if (name === FunctionName.THIS) return that
      if (name === FunctionName.CLONE) return clone
      if (name === FunctionName.PRINT) return print
      if (name === FunctionName.SET) return set(this.resolve.bind(this))
      if (name === FunctionName.GET) return get(this.resolve.bind(this))
      if (name === FunctionName.COND) return cond
      if (name === FunctionName.LOOP) return loop
      return () => input => input
    }

    getGeneratorFromFunctionElement (this: Tree, element: Element): TransformerFunctionGenerator | undefined {
      const functionName = element.tagName.toLowerCase()
      const generator = this.getGeneratorFromFunctionName(functionName as any)
      return generator
    }

    resolveFunctionRawArgs (this: Tree, ...rawArgs: Element[]): (TreeValue | Transformer)[] {
      // <function> // Works on inputValue, params inside
      //   <value> // resolved value is first param
      //   <function> // resolved function on current inputValue is 2nd param
      //   <transformer> // resolved transformer on current inputValue is 3rd param
      // </function>
      // <transformer>
      //   <function> // apply resolved function on inputValue
      //   <value> // set inputValue to this resolved value
      //   <transformer> // apply resolved transformer on inputValue
      // </transformer>
      return rawArgs.reduce<(TreeValue | Transformer)[]>((args, argElement) => {
        const newArgs = [...args]
        const kind = getNodeKind(argElement)
        if (kind === 'element') {
          const lastArgPos = args.length - 1
          const lastArg = args[lastArgPos]
          const fragment = document.createDocumentFragment()
          if (lastArg instanceof NodeList) {
            fragment.append(...lastArg, argElement)
            newArgs[lastArgPos] = fragment.childNodes
          } else {
            fragment.append(argElement)
            newArgs.push(fragment.childNodes)
          }
          return newArgs
        }
        if (kind === 'function') {
          const generator = this.getGeneratorFromFunctionElement(argElement)
          if (generator === undefined) return newArgs
          const rawArgs = this.getFunctionElementRawArgs(argElement)
          const args = this.resolveFunctionRawArgs(...rawArgs)
          newArgs.push(generator(...args))
          return newArgs
        }
        if (kind === 'transformer') {
          const transformerRawItems = this.getFunctionElementRawArgs(argElement)
          const transformerResolvedItems = this.resolveFunctionRawArgs(...transformerRawItems)
          newArgs.push(...transformerResolvedItems)
          return newArgs
        }
        if (kind === 'named' || kind === 'positionned') {
          const elementTree = new Tree({ node: argElement, parent: this })
          newArgs.push(elementTree.value)
        }
        return newArgs
      }, [])
    }

    getTransformerFromTypeName (this: Tree, type: Type): Transformer {
      if (type === Type.STRING) return toString()
      if (type === Type.NUMBER) return toNumber()
      if (type === Type.BOOLEAN) return toBoolean()
      if (type === Type.NULL) return toNull()
      if (type === Type.HTML) return toHtml()
      if (type === Type.REF) return toRef(this.resolve.bind(this))()
      if (type === Type.ARRAY) return toArray()
      if (type === Type.RECORD) return toRecord()
      return input => input
    }

    get masterTransformer (): Transformer {
      const { children: { transformers } } = this

      // Inner transformations
      const innerTransformer = (input: TreeValue) => {
        return transformers.reduce<TreeValue>((reducedValue, transformerNode) => {
          const isElement = transformerNode instanceof Element
          if (!isElement) return reducedValue
          const isFunction = isFunctionElement(transformerNode)
          if (isFunction) {
            const rawArgs = this.getFunctionElementRawArgs(transformerNode)
            const args = this.resolveFunctionRawArgs(...rawArgs)
            const generator = this.getGeneratorFromFunctionElement(transformerNode)
            if (generator === undefined) return reducedValue
            const transformer = generator(...args)
            return transformer(reducedValue)
          }
          const transformerRawItems = this.getFunctionElementRawArgs(transformerNode)
          const transformerResolvedItems = this.resolveFunctionRawArgs(...transformerRawItems)
          return transformerResolvedItems.reduce<TreeValue>((inputValue, valueOrTransformer) => {
            if (typeof valueOrTransformer === 'function') return valueOrTransformer(inputValue)
            return valueOrTransformer
          }, reducedValue)
        }, input)
      }

      // Type transformations
      const typeTransformer = (input: TreeValue) => {
        const { node } = this
        if (!(node instanceof Element)) return input
        const everyChildIsText = [...node.childNodes].every(node => node instanceof Text)
        let type = getTypeFromElement(node)
        if (type === null && everyChildIsText) { type = Type.STRING }
        if (type !== null) {
          const typeTransformer = this.getTransformerFromTypeName(type)
          if (typeTransformer !== undefined) return typeTransformer(input)
        }
        return input
      }

      // Returned master transformer
      return (input: TreeValue): TreeValue => {
        const innerTransformed = innerTransformer(input)
        const typed = typeTransformer(innerTransformed)
        return typed
      }
    }

    get value (): TreeValue {
      const { pretransformed, masterTransformer } = this
      const transformed = masterTransformer(pretransformed)
      return transformed
    }

    get wrapped (): Element | undefined {
      const { value, node } = this
      if (!(node instanceof Element)) return undefined
      const valueNode = createValueNode(value)
      if (valueNode === undefined) return undefined
      const attributes = [...node.attributes]
      attributes.forEach(attribute => {
        if (attribute.name === 'wrap') return;
        if (attribute.name === 'nowrap') return;
        valueNode?.setAttribute(attribute.name, attribute.value)
      })
      return valueNode
    }
  }

  /* ========== ACTIONS ========== */

  export enum Action {
    APPEND = 'append',
    PREPEND = 'prepend',
    OVERWRITE = 'overwrite'
  }

  /* ========== TYPES ========== */

  export enum Type {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    HTML = 'lm-html',
    REF = 'ref',
    ARRAY = 'array',
    RECORD = 'record',
    DATA = 'data',
    TRANSFORMER = 'transformer',
  }

  export const Types = Object.values(Type)

  export function isType (tag: string): tag is Type {
    return Types.includes(tag as any)
  }

  /* ========== FUNCTIONS & TRANSFORMERS ========== */

  export enum FunctionName {
    /* Cast */
    TOSTRING = 'tostring',
    TONUMBER = 'tonumber',
    TOBOOLEAN = 'toboolean',
    TONULL = 'tonull',
    TOHTML = 'tohtml',
    TOREF = 'toref',
    TOARRAY = 'toarray',
    TORECORD = 'torecord',
    /* Number */
    ADD = 'add',
    SUBTRACT = 'subtract',
    MULTIPLY = 'multiply',
    DIVIDE = 'divide',
    POW = 'pow',
    MAX = 'max',
    MIN = 'min',
    CLAMP = 'clamp',
    GREATER = 'greater',
    SMALLER = 'smaller',
    EQUALS = 'equals',
    /* String */
    APPEND = 'append',
    PREPEND = 'prepend',
    REPLACE = 'replace',
    TRIM = 'trim',
    SPLIT = 'split',
    /* Array */
    JOIN = 'join',
    AT = 'at',
    MAP = 'map',
    PUSH = 'push',
    /* Utility */
    THIS = 'this',
    CLONE = 'clone',
    PRINT = 'print',
    SET = 'set',
    GET = 'get',
    COND = 'cond',
    LOOP = 'loop'
  }

  export const Functions = Object.values(FunctionName)

  export function isFunctionName (tag: string): tag is FunctionName {
    return Functions.includes(tag as any)
  }

  const functionsAndTypesNamesOverlap = Object.values(Function).some(isType)
  if (functionsAndTypesNamesOverlap) throw `A function cannot share its name with a type`

  export const transformers = {
    /* Cast    */ toString, toNumber, toBoolean, toNull, toHtml, toRef, toArray, toRecord,
    /* Number  */ add, subtract, multiply, pow, divide, max, min, clamp, greater, smaller, equals,
    /* String  */ append, prepend, replace, trim, split,
    /* Array   */ join, at, map, push,
    /* Utility */ that, clone, print, set, get, cond, loop
  }

  /* ========== HELPERS ========== */

  export function isValueElement (node: Node) {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    if (!isType(typeTag) || typeTag === Type.TRANSFORMER) return false
    return true
  }

  export function isTransformerElement (node: Node) {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    return typeTag === Type.TRANSFORMER
  }

  export function isValueOrTransformerElement (node: Node) {
    return isValueElement(node)
      || isTransformerElement(node)
  }

  export function isFunctionElement (node: Node) {
    const isElement = node instanceof Element
    if (!isElement) return false
    const functionTag = node.tagName.toLowerCase()
    return isFunctionName(functionTag)
  }

  export function getNodeKind (node: Node) {
    if (node instanceof Text) return 'text'
    if (!(node instanceof Element)) return undefined
    const isValue = isValueElement(node)
    const isTransformer = isTransformerElement(node)
    const isFunction = isFunctionElement(node)
    if (isTransformer) return 'transformer'
    if (isFunction) return 'function'
    if (isValue) {
      const classAttr = node.getAttribute('class')
      if (classAttr === null || classAttr === '') return 'positionned'
      return 'named'
    }
    return 'element'
  }

  export function valueIsRecord (value: TreeValue): value is { [key: string]: TreeValue } {
    return typeof value === 'object'
      && !Array.isArray(value)
      && !(value instanceof NodeList)
      && value !== null
  }

  export function getTypeFromElement (element: Element): Exclude<Type, Type.DATA> | null {
    if (!isValueOrTransformerElement(element)) return null
    const typeTag = element.tagName.toLowerCase() as Type // if isValueOrTransformerElement(element), then element.tagName is Type
    let type: Exclude<Type, Type.DATA> | null
    if (isType(typeTag) && typeTag !== Type.DATA) { type = typeTag }
    else { type = null }
    return type
  }

  export function cloneNode<T extends Node> (node: T, deep?: boolean): T {
    return node.cloneNode(deep) as T
  }

  export function createPrimitiveValueNode (value: TreePrimitiveValue): Element | undefined {
    if (value === undefined) return undefined
    let type: 'string' | 'number' | 'boolean' | 'null' | 'lm-html'
    if (typeof value === 'string') { type = 'string' }
    else if (typeof value === 'number') { type = 'number' }
    else if (typeof value === 'boolean') { type = 'boolean' }
    else if (value === null) { type = 'null' }
    else { type = 'lm-html' } /* (value instanceof NodeList) */
    const wrapper = document.createElement(type)
    if (value instanceof NodeList) wrapper.append(...value)
    else wrapper.append(toString()(value))
    return wrapper
  }

  export function createValueNode (value: TreeValue): Element | undefined {
    if (Array.isArray(value)) {
      const wrapper = document.createElement('array')
      const children = value
        .map(val => createValueNode(val))
        .filter((e): e is Element => e !== undefined)
      wrapper.append(...children)
      return wrapper
    }
    if (valueIsRecord(value)) {
      const wrapper = document.createElement('record')
      Object.keys(value).forEach(key => {
        const val = value[key]
        const elt = createValueNode(val)
        if (elt === undefined) return
        elt.classList.add(key)
        wrapper.append(elt)
      })
      return wrapper
    }
    return createPrimitiveValueNode(value)
  }

  // MERGE
  // On prend tout les darkdouille dans l'ordre et on les append un par un dans un nouveau data element.

  // REDUCE
  // Dans le résultat, on liste les enfants
  // 
  // Pour chaque enfant
  //   si ni text ni element, il disparait
  //   si text, on ne fait rien de plus
  //   si element mais pas transformer, value ou function, on ne fait rien de plus
  //   si transformer ou function, on déplace l'element tout en bas de son parent et on s'arrête
  //   sinon, c'est un élément de type value
  //     si il y a une classe sur l'élément, c'est une propriété nommée du parent
  //     sinon, c'est une propriété positionnée (numérotée)
  //     on regarde dans le registre du parent si une propriété a déjà ce nom
  //     si ça n'est pas le cas, on enregistre cette valeur dans le registre, avec son nom de propriété
  //     si le registre a déjà une entrée à ce nom :
  //       si l'élément actuel a un type spécifié, on écrase le type de l'élément enregistré
  //       si l'élément actuel a une action de type append, on ajoute tous ses enfants à la fin de l'élément enregistré
  //       s'il a une action de type prepend, on ajoute tous ses enfants au début de l'élément enregistré
  //       s'il n'a pas d'action ou une action de type overwrite, on remplace les enfants de l'élément enregistré par ceux de l'élément actuel
  // 
  // Pour chaque enfant à nouveau
  //   s'il n'est pas une valeur darkdouille (uniquement valeur, pas transformeur ni function), on ne fait rien
  //   sinon, c'est un élément valeur, on lui applique REDUCE

  export function reduce (element: Element): Element {
    const childNodes = [...element.childNodes]
    let unnamedChildrenCnt = 0
    const propertiesPathsMap = new Map<string, Element>()
    childNodes.forEach(childNode => {
      if (childNode.nodeType === Node.TEXT_NODE) return
      if (childNode.nodeType !== Node.ELEMENT_NODE) return childNode.parentNode?.removeChild(childNode)
      const childElement = childNode as Element
      const isFunction = isFunctionElement(childElement)
      const isTransformer = isTransformerElement(childElement)
      if (isFunction || isTransformer) return element.appendChild(childElement)
      const isValue = isValueElement(childElement)
      if (!isValue) return
      const valueElement: Element = childElement
      const type = getTypeFromElement(valueElement)
      if (type === Type.TRANSFORMER) return element.appendChild(valueElement)
      const localPath = valueElement.getAttribute('class') ?? `${unnamedChildrenCnt ++}`
      const existingElement = propertiesPathsMap.get(localPath)
      if (existingElement === undefined) return propertiesPathsMap.set(localPath, valueElement)
      valueElement.remove()
      const actionAttr = valueElement.getAttribute('action')
      if (actionAttr === Action.APPEND) return existingElement.append(...valueElement.childNodes)
      if (actionAttr === Action.PREPEND) return existingElement.prepend(...valueElement.childNodes)
      return existingElement.replaceChildren(...valueElement.childNodes)
    })
    const reducedChildNodes = [...element.childNodes]
    reducedChildNodes.forEach(valueElement => {
      const isDarkdouilleElement = isValueOrTransformerElement(valueElement)
      if (!isDarkdouilleElement) return;
      const isElement = valueElement instanceof Element
      if (!isElement) return;
      const type = getTypeFromElement(valueElement)
      if (type === Type.TRANSFORMER) return;
      reduce(valueElement)
    })
    return element
  }

  export function merge (...darkdouilleElements: Element[]) {
    const rootElement = document.createElement('data')
    darkdouilleElements.forEach(darkdouille => {
      const darkdouilleNodes = [...(cloneNode(darkdouille, true)).childNodes]
      rootElement.append(...darkdouilleNodes)
    })
    return rootElement
  }

  export function tree (darkdouilleElements: Element[], parentTree?: Tree) {
    const merged = merge(...darkdouilleElements)
    const reduced = reduce(merged)
    const tree = new Tree({
      node: reduced,
      parent: parentTree
    })
    return tree
  }
}
