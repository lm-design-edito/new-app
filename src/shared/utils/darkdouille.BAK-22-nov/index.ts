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

  type TreeConstructorOptions = {
    element: Element
    parent: Tree | undefined
    id?: string
  }

  type TreeTypedValueChild = { node: Node, type: 'text' } | { element: Element, type: 'named' | 'unnamed' | 'element' }

  export type Transformer<T extends TreeValue = TreeValue> = (input: TreeValue) => T
  export type TransformerFunctionGenerator<T extends TreeValue = TreeValue> = (...args: (TreeValue | Transformer)[]) => Transformer<T>

  type TreePrimitiveValue = string | number | boolean | null | undefined | NodeListOf<Node>
  export type TreeValue = TreePrimitiveValue | TreeValue[] | { [key: string]: TreeValue }

  export type TreeResolver = (path: string) => Tree | undefined

  export class Tree {

    id?: string
    element: Element
    parent: Tree | undefined

    constructor (options: TreeConstructorOptions) {
      this.id = options.id
      this.element = options.element
      this.parent = options.parent
      this.getFunctionElementRawArgs = this.getFunctionElementRawArgs.bind(this)
      this.getGeneratorFromFunctionName = this.getGeneratorFromFunctionName.bind(this)
      this.getGeneratorFromFunctionElement = this.getGeneratorFromFunctionElement.bind(this)
      this.resolveFunctionRawArgs = this.resolveFunctionRawArgs.bind(this)
      this.getTransformerFromTypeName = this.getTransformerFromTypeName.bind(this)
      this.resolve = this.resolve.bind(this)
      console.log('new Tree — ', this)
    }

    get type () {
      return getTypeFromElement(this.element)
    }

    get childNodes (): NodeListOf<Node> {
      return this.element.childNodes
    }

    get sortedChildNodes (): { values: Array<Node>, transformers: Array<Element> } {
      const { childNodes } = this
      return [...childNodes].reduce((reduced, childNode) => {
        const isTransformerOrFunction = isTransformerElement(childNode) || isFunctionElement(childNode)
        if (isTransformerOrFunction) return { ...reduced, transformers: [...reduced.transformers, childNode as Element] }
        else return { ...reduced, values: [...reduced.values, childNode] }
      }, {
        values: [] as Array<Node>,
        transformers: [] as Array<Element>
      })
    }

    get typedChildValueNodes (): TreeTypedValueChild[] {
      const { sortedChildNodes: { values } } = this
      return values.map(node => {
        if (node.nodeType === Node.TEXT_NODE) return { node, type: 'text' }
        if (node.nodeType !== Node.ELEMENT_NODE) return undefined
        const element = node as Element
        const isValue = isValueElement(element)
        if (!isValue) return { element, type: 'element' }
        const classAttr = element.getAttribute('class')
        if (classAttr === null || classAttr === '') return { element, type: 'unnamed' }
        return { element, type: 'named' }
      }).filter((item): item is TreeTypedValueChild => item !== undefined)
    }

    get subtrees (): { [key: string]: Tree } | (Tree | string)[] {
      const { typedChildValueNodes } = this
      const hasNamedValues = typedChildValueNodes.some(item => item.type === 'named')
      console.log('typedChildValueNodes', typedChildValueNodes)
      if (hasNamedValues) {
        return typedChildValueNodes.reduce((reduced, item) => {
          if (item.type !== 'named') return reduced
          const classAttr = item.element.getAttribute('class')
          if (classAttr === null || classAttr === '') return reduced
          return {
            ...reduced,
            [classAttr]: new Tree({
              element: item.element,
              parent: this,
              id: 'CREATED FROM SUBTREES'
            })
          }
        }, {} as { [key: string]: Tree })
      } else {
        return typedChildValueNodes.map(item => {
          if (item.type === 'text') return item.node.textContent ?? ''
          else if (item.type === 'element' || item.type === 'unnamed') return new Tree({
            element: item.element,
            parent: this,
            id: 'CREATED FROM SUBTREES'
          })
          return undefined
        }).filter((elt): elt is Tree | string => elt !== undefined)
      }
    }

    get untransformedValue (): TreeValue {
      const { subtrees } = this
      if (Array.isArray(subtrees)) {
        if (subtrees.every(item => typeof item === 'string')) return subtrees.join('')
        return subtrees.map(subtree => {
          if (typeof subtree === 'string') return subtree
          return subtree.value
        })
      } else {
        return Object
          .keys(subtrees)
          .reduce((reduced, key) => ({
            ...reduced,
            [key]: subtrees[key]?.value
          }), {}) as { [key: string]: TreeValue }
      }
    }

    getFunctionElementRawArgs (this: Tree, functionElement: Element): Element[] {
      // const functionTree = new Tree({ element: functionElement, parent: this })
      // const functionChildren = [...functionTree.childNodes]
      // const functionNoTextChildren = functionChildren.filter((child): child is Element => child instanceof Element)
      return [] // functionNoTextChildren
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
        const isTransformer = isTransformerElement(argElement)
        const isFunction = isFunctionElement(argElement)
        const isValue = isValueElement(argElement)
        const isNeither = !isTransformer && !isFunction && !isValue
        if (isNeither) {
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
        if (isFunction) {
          const generator = this.getGeneratorFromFunctionElement(argElement)
          if (generator === undefined) return newArgs
          const rawArgs = this.getFunctionElementRawArgs(argElement)
          const args = this.resolveFunctionRawArgs(...rawArgs)
          newArgs.push(generator(...args))
          return newArgs
        }
        if (isTransformer) {
          const transformerRawItems = this.getFunctionElementRawArgs(argElement)
          const transformerResolvedItems = this.resolveFunctionRawArgs(...transformerRawItems)
          newArgs.push(...transformerResolvedItems)
          return newArgs
        }
        if (isValue) {
          // const elementTree = new Tree({ element: argElement, parent: this })
          // newArgs.push(elementTree.value)
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
      const { sortedChildNodes } = this
      const { transformers } = sortedChildNodes

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
      console.group(this.element)
      const { untransformedValue, masterTransformer, element } = this
      let toTransform: TreeValue = untransformedValue
      const isValue = isValueElement(element)
      if (!isValue) {
        const fragment = document.createDocumentFragment()
        const clone = element.cloneNode(true) as Element
        fragment.append(clone)
        if (Array.isArray(untransformedValue)) {
          untransformedValue.forEach(value => {
            if (value instanceof NodeList) clone.append(...value)
            const node = document.createTextNode(toString()(value))
            clone.append(node)
          })
        }
        toTransform = fragment.childNodes
      }
      const transformed = masterTransformer(toTransform)
      console.groupEnd()
      return transformed
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

    get pathFromParent () {
      const { parent, element } = this
      if (parent === undefined) return undefined
      const parentSubtrees = parent.subtrees
      if (Array.isArray(parentSubtrees)) {
        const foundIndex = parentSubtrees.findIndex(parentSubTree => {
          if (typeof parentSubTree === 'string') return false
          return parentSubTree.element === element
        })
        if (foundIndex === -1) return undefined
        return `${foundIndex}`
      } else {
        const foundKey = Object.keys(parentSubtrees).find(key => {
          const subtree = parentSubtrees[key]
          if (subtree === undefined) return false
          return subtree.element === element
        })
        if (foundKey === undefined) return undefined;
        return `${foundKey}`
      }
    }

    get path (): string | undefined {
      const { parents } = this
      return parents.reduce((path, parent) => {
        const parentPath = parent.pathFromParent
        if (parentPath === undefined) return `/${path}`
        return `${parent.pathFromParent}/${path}`
      }, this.pathFromParent)
    }

    resolve: TreeResolver = function (this: Tree, path: string) {
      const pathChunks = path.split('/').filter(e => e.trim() !== '')
      const startFromRoot = path[0] === '/'
      const startTree = startFromRoot ? this.root : this
      const returned = pathChunks.reduce((prevTree, pathChunk) => {
        if (prevTree === undefined) return undefined
        if (pathChunk === '.') return prevTree
        if (pathChunk === '..') return prevTree.parent
        const { subtrees } = prevTree
        if (Array.isArray(subtrees)) {
          const pos = parseInt(pathChunk)
          const subtree = subtrees[pos]
          if (typeof subtree === 'string' || subtree === undefined) return undefined
          return subtree
        } else {
          return subtrees[pathChunk]
        }
      }, startTree as Tree | undefined)
      return returned
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
    TRANSFORMER = 'transformer'
  }
  
  export const Types = Object.values(Type)
  
  export function isType (tag: string): tag is Type {
    return Types.includes(tag as any)
  }

  /* ========== FUNCTIONS ========== */

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
      element: reduced,
      parent: parentTree
    })
    return tree
  }
}
