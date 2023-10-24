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
  export const transformers = {
    /* Cast    */ toString, toNumber, toBoolean, toNull, toHtml, toRef, toArray, toRecord,
    /* Number  */ add, subtract, multiply, pow, divide, max, min, clamp, greater, smaller, equals,
    /* String  */ append, prepend, replace, trim, split,
    /* Array   */ join, at, map, push,
    /* Utility */ that, clone, print, set, get, cond, loop
  }

  type TreeTextChildItem = { type: 'text', node: Node }
  type TreeDomChildItem = { type: 'dom', element: Element }
  type TreeNamedChildItem = { type: 'named', element: Element }
  type TreeUnnamedChildItem = { type: 'unnamed', element: Element }
  type TreeTransformerChildItem = { type: 'transformer', element: Element }
  type TreeFunctionChildItem = { type: 'function', element: Element }
  type TreeChildItem = TreeTextChildItem | TreeDomChildItem | TreeNamedChildItem | TreeUnnamedChildItem | TreeTransformerChildItem | TreeFunctionChildItem
  type TreePrimitiveValue = string | number | boolean | null | undefined | NodeListOf<Node>
  export type TreeValue = TreePrimitiveValue | TreeValue[] | { [key: string]: TreeValue }
  export type TreeResolver = (path: string) => Tree | undefined
  export type Transformer<T extends TreeValue = TreeValue> = (input: TreeValue) => T
  export type TransformerFunctionGenerator<T extends TreeValue = TreeValue> = (...args: (TreeValue | Transformer)[]) => Transformer<T>

  /* ========== ACTIONS ========== */

  enum Action {
    APPEND = 'append',
    PREPEND = 'prepend',
    OVERWRITE = 'overwrite'
  }
  
  /* ========== TYPES ========== */

  enum Type {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    HTML = 'lm-html',
    REF = 'ref',
    ARRAY = 'array',
    RECORD = 'record',
    DATA = 'data',
    TRANSFORMER = 'transformer'
  }
  
  const Types = Object.values(Type)
  
  function isType (tag: string): tag is Type {
    return Types.includes(tag as any)
  }

  /* ========== FUNCTIONS ========== */
  enum FunctionName {
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

  const Functions = Object.values(FunctionName)
  
  function isFunctionName (tag: string): tag is FunctionName {
    return Functions.includes(tag as any)
  }

  const functionsAndTypesNamesOverlap = Object
    .values(Function)
    .some(funcName => isType(funcName))
  if (functionsAndTypesNamesOverlap) throw `A function cannot share its name with a type`

  /* ========== HELPERS ========== */

  function isValueElement (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    if (!isType(typeTag) || typeTag === Type.TRANSFORMER) return false
    return true
  }

  function isTransformerElement (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    const typeAttr = node.getAttribute('type')
    return typeTag === Type.DATA
      && typeAttr === Type.TRANSFORMER
      ? true
      : typeTag === Type.TRANSFORMER
  }

  function isValueOrTransformerElement (node: Node): node is Element {
    return isValueElement(node) || isTransformerElement(node)
  }

  function isFunctionElement (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const functionTag = node.tagName.toLowerCase()
    return isFunctionName(functionTag)
  }

  function getTypeFromElement (element: Element): Exclude<Type, Type.DATA> | null {
    if (!isValueOrTransformerElement(element)) return null
    const typeTag = element.tagName.toLowerCase() as Type // if isValueOrTransformerElement(element), then element.tagName is Type
    const typeAttr = element.getAttribute('type')
    let type: Exclude<Type, Type.DATA> | null
    if (typeAttr !== null && isType(typeAttr) && typeAttr !== Type.DATA) { type = typeAttr }
    else if (isType(typeTag) && typeTag !== Type.DATA) { type = typeTag }
    else { type = null }
    return type
  }

  function cloneNode<T extends Node> (node: T, deep?: boolean): T {
    return node.cloneNode(deep) as T
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

  function reduce (element: Element): Element {
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
      if (type !== null) existingElement.setAttribute('type', type)
      const actionAttr = valueElement.getAttribute('action')
      if (actionAttr === Action.APPEND) return existingElement.append(...valueElement.childNodes)
      if (actionAttr === Action.PREPEND) return existingElement.prepend(...valueElement.childNodes)
      return existingElement.replaceChildren(...valueElement.childNodes)
    })
    const reducedChildNodes = [...element.childNodes]
    reducedChildNodes.forEach(valueElement => {
      const isDarkdouilleElement = isValueOrTransformerElement(valueElement)
      if (!isDarkdouilleElement) return;
      const type = getTypeFromElement(valueElement)
      if (type === Type.TRANSFORMER) return;
      reduce(valueElement)
    })
    return element
  }

  function merge (...darkdouilleElements: Element[]) {
    const rootElement = document.createElement('data')
    darkdouilleElements.forEach(darkdouille => {
      const darkdouilleNodes = [...(cloneNode(darkdouille, true)).childNodes]
      rootElement.append(...darkdouilleNodes)
    })
    return rootElement
  }

  /* ========== VALUE TYPE CHECKERS ========== */

  export function valueIsRecord (value: TreeValue): value is { [key: string]: TreeValue } {
    return typeof value === 'object'
      && !Array.isArray(value)
      && !(value instanceof NodeList)
      && value !== null
  }

  /* ========== TREE ========== */

  export class Tree {
    element: Element
    parent: Tree | undefined
    _pathForResolver: string | undefined
    
    constructor (element: Element, parentTree?: Tree, pathForResolver?: string) {
      this.element = element
      this.parent = parentTree
      this._pathForResolver = pathForResolver
      this.resolve = this.resolve.bind(this)
      this.getGeneratorFromFunctionElement = this.getGeneratorFromFunctionElement.bind(this)
      this.getFunctionElementRawArgs = this.getFunctionElementRawArgs.bind(this)
      this.resolveFunctionRawArgs = this.resolveFunctionRawArgs.bind(this)
      this.getTransformerFromTypeName = this.getTransformerFromTypeName.bind(this)
      this.getGeneratorFromFunctionName = this.getGeneratorFromFunctionName.bind(this)
    }

    get elementStr (): string {
      const clone = this.element.cloneNode() as Element
      return clone.outerHTML
    }

    get parents (): Tree[] {
      let currentTree = this.parent
      const parents: Tree[] = []
      while (true) {
        if (currentTree === undefined) break;
        parents.push(currentTree)
        currentTree = currentTree.parent
      }
      return parents
    }

    get root (): Tree {
      const { parents } = this
      const lastParent = parents[parents.length - 1]
      if (lastParent === undefined) return this
      return lastParent
    }

    get path (): string | undefined {
      let previousTree: Tree = this
      let currentTree = this.parent
      const reversedPathArr: (string | undefined)[] = []
      while (true) {
        if (currentTree === undefined) break; 
        const currentTreeChildren = currentTree.children
        if (currentTreeChildren instanceof NodeList) { reversedPathArr.push(undefined) }
        else if (Array.isArray(currentTreeChildren)) {
          const index = currentTreeChildren.findIndex(child => child.element === previousTree.element)
          if (index === -1) { reversedPathArr.push(undefined) }
          else { reversedPathArr.push(`${index}`) }
        } else {
          const keys = Object.keys(currentTreeChildren)
          const key = keys.find(key => currentTreeChildren[key]?.element === previousTree.element)
          reversedPathArr.push(key)
        }
        previousTree = currentTree
        currentTree = currentTree.parent
      }
      if (reversedPathArr.includes(undefined)) return undefined
      const path = `/${reversedPathArr.reverse().join('/')}`
      return path
    }

    get pathForResolver () {
      return this._pathForResolver ?? this.path
    }

    resolve: TreeResolver = function (this: Tree, path: string) {
      const pathChunks = path
        .split('/')
        .filter(e => e.trim() !== '')
      const startFromRoot = path[0] === '/'
      const startTree = startFromRoot ? this.root : this
      const returned = pathChunks.reduce((prevTree, pathChunk) => {
        if (prevTree === undefined) return undefined
        if (pathChunk === '.') return prevTree
        if (pathChunk === '..') return prevTree.parent
        const { children } = prevTree
        if (children instanceof NodeList) return undefined
        if (Array.isArray(children)) return children[parseInt(pathChunk)]
        return children[pathChunk]
      }, startTree as Tree | undefined)
      return returned
    }

    get type () {
      return getTypeFromElement(this.element)
    }

    get sortedChildren (): TreeChildItem[] {
      const treeNodesOrNull: Array<TreeChildItem | null> = [...this.element.childNodes].map(childNode => {
        if (childNode.nodeType === Node.TEXT_NODE) return { type: 'text', node: childNode }
        if (childNode.nodeType !== Node.ELEMENT_NODE) return null
        // Is Element
        const childElement = childNode as Element
        const isFunction = isFunctionElement(childElement)
        const isTransformer = isTransformerElement(childElement)
        const isValue = isValueElement(childElement)
        const isDarkdouille = isFunction || isTransformer || isValue
        if (!isDarkdouille) return { type: 'dom', element: childElement as Element } // TS thinks childElement is of type never
        // Is value, transformer or function  Element
        if (isFunction) return { type: 'function', element: childElement }
        else if (isTransformer) return { type: 'transformer', element: childElement as Element }
        // Is value Element
        const valueElement: Element = childElement
        const classAttr = valueElement.getAttribute('class')
        const isUnnamed = classAttr === null
        if (isUnnamed) return { type: 'unnamed', element: valueElement }
        return { type: 'named', element: valueElement }
      })
      const treeNodes: TreeChildItem[] = treeNodesOrNull
        .filter((e): e is TreeChildItem => e !== null)
      return treeNodes
    }

    get children (): NodeListOf<Node> | { [key: string]: Tree } | Tree[] {
      const { sortedChildren } = this
      const htmlChildItems = sortedChildren.filter(({ type }) => type === 'text' || type === 'dom') as Array<TreeDomChildItem | TreeTextChildItem>
      const unnamedChildItems = sortedChildren.filter(({ type }) => type === 'unnamed') as Array<TreeUnnamedChildItem>
      const namedChildItems = sortedChildren.filter(({ type }) => type === 'named') as Array<TreeNamedChildItem>
      let children: NodeListOf<Node> | { [key: string]: Tree } | Tree[]
      if (namedChildItems.length > 0) {
        children = namedChildItems.reduce((record, childItem) => {
          const classAttr = childItem.element.getAttribute('class')
          if (classAttr === null) return record
          return { ...record, [classAttr]: new Tree(childItem.element, this) }
        }, {} as { [key: string]: Tree })
      } else if (unnamedChildItems.length > 0) {
        children = unnamedChildItems
          .map(childItem => new Tree(childItem.element, this))
      } else  {
        children = htmlChildItems
          .map((childItem) => childItem.type === 'text' ? childItem.node : childItem.element)
          .reduce((fragment, node) => {
            fragment.appendChild(node.cloneNode(true))
            return fragment
          }, document.createDocumentFragment())
          .childNodes
      }
      return children
    }

    get untransformedValue (): TreeValue {
      const { children } = this
      if (children instanceof NodeList) {
        const allTextNodes = [...children].every(node => node.nodeType === Node.TEXT_NODE)
        if (allTextNodes) return [...children]
          .map(child => child.textContent ?? '')
          .join('')
        return children
      }
      if (Array.isArray(children)) return children.map(({ value }) => value)
      return Object
        .keys(children)
        .reduce((record, key) => ({ ...record, [key]: children[key]?.value }), {})
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

    getGeneratorFromFunctionElement (
      this: Tree,
      element: Element
    ): TransformerFunctionGenerator | undefined {
      const functionName = element.tagName.toLowerCase()
      const generator = this.getGeneratorFromFunctionName(functionName as any)
      return generator
    }

    getFunctionElementRawArgs (this: Tree, functionElement: Element): Exclude<TreeChildItem, TreeTextChildItem>[] {
      // [WIP] Giving a pathForResoler to new Tree here because tree.path
      // doesnt work for nested functions and transformers.
      // Should find a better way to calculate tree.path later.
      // Path is needed to spot circular reference patterns in 
      // toRef transformer.
      // Maybe if this.parent cannot find this in its children,
      // append <transformer> in path ? /ROOT
      const functionTree = new Tree(functionElement, this, this.path)
      const functionSortedChildren = functionTree.sortedChildren
      // [WIP] Or maybe just without empty text items ?
      const withoutTextItems = functionSortedChildren.filter((item): item is Exclude<TreeChildItem, TreeTextChildItem> => item.type !== 'text')
      return withoutTextItems
    }

    // [WIP] Maybe this should only return TreeValue[], so that generators expect ...args: TreeValue[] as parameters ?
    // [EDIT] probably not because map needs to resolve args on each array item and not on the array itself
    resolveFunctionRawArgs (this: Tree, ...rawArgs: Exclude<TreeChildItem, TreeTextChildItem>[]): (TreeValue | Transformer)[] {
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
      return rawArgs.reduce<(TreeValue | Transformer)[]>((args, { type, element }) => {
        const newArgs = [...args]
        if (type === 'dom') {
          const lastArgPos = args.length - 1
          const lastArg = args[lastArgPos]
          const fragment = document.createDocumentFragment()
          if (lastArg instanceof NodeList) {
            fragment.append(...lastArg, element)
            newArgs[lastArgPos] = fragment.childNodes
          } else {
            fragment.append(element)
            newArgs.push(fragment.childNodes)
          }
          return newArgs
        }
        if (type === 'function') {
          const generator = this.getGeneratorFromFunctionElement(element)
          if (generator === undefined) return newArgs
          const rawArgs = this.getFunctionElementRawArgs(element)
          const args = this.resolveFunctionRawArgs(...rawArgs)
          newArgs.push(generator(...args))
          return newArgs
        }
        if (type === 'transformer') {
          const transformerRawItems = this.getFunctionElementRawArgs(element)
          const transformerResolvedItems = this.resolveFunctionRawArgs(...transformerRawItems)
          newArgs.push(...transformerResolvedItems)
          return newArgs
        }
        if (type === 'named' || type === 'unnamed') {
          const elementTree = new Tree(element, this, this.path)
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
      const { sortedChildren } = this
      const transformerOrFunctionChildItems = sortedChildren.filter(({ type }) => {
        return ['transformer', 'function'].includes(type)
      }) as Array<TreeTransformerChildItem | TreeFunctionChildItem>
      // Inner transformations
      const innerTransformer = (input: TreeValue) => {
        return transformerOrFunctionChildItems.reduce<TreeValue>((inputValue, { type, element }) => {
          if (type === 'function') {
            const rawArgs = this.getFunctionElementRawArgs(element)
            const args = this.resolveFunctionRawArgs(...rawArgs)
            const generator = this.getGeneratorFromFunctionElement(element)
            if (generator === undefined) return inputValue
            const transformer = generator(...args)
            return transformer(inputValue)
          }
          const transformerRawItems = this.getFunctionElementRawArgs(element)
          const transformerResolvedItems = this.resolveFunctionRawArgs(...transformerRawItems)
          return transformerResolvedItems.reduce<TreeValue>((inputValue, valueOrTransformer) => {
            if (typeof valueOrTransformer === 'function') return valueOrTransformer(inputValue)
            return valueOrTransformer
          }, inputValue)
        }, input)
      }
      // Type transformations
      const typeTransformer = (input: TreeValue) => {
        const { element } = this
        const everyChildIsText = [...element.childNodes].every(node => node.nodeType === Node.TEXT_NODE)
        let type = getTypeFromElement(element)
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
      const { untransformedValue, masterTransformer } = this
      const returned = masterTransformer(untransformedValue)
      return returned
    }
  }

  export function tree (...darkdouilleElements: Element[]) {
    const merged = merge(...darkdouilleElements)
    const reduced = reduce(merged)
    const tree = new Tree(reduced)
    return tree
  }
}
