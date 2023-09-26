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
// import replace from './transformers/replace'
// import replaceWithRef from './transformers/replaceWithRef'
// import trim from './transformers/trim'
// import split from './transformers/split'
/* Array transformers */
// import join from './transformers/join'
// import at from './transformers/at'
// import map from './transformers/map'
// import push from './transformers/push'
/* Utility transformers */
import clone from './transformers/clone'
import print from './transformers/print'
// import variable from './transformers/variable'
// import condition from './transformers/condition'
// import iteration from './transformers/iteration'

export namespace Darkdouille {

  type TreeTextChildItem = { type: 'text', node: Node }
  type TreeDomChildItem = { type: 'dom', element: Element }
  type TreeNamedChildItem = { type: 'named', element: Element }
  type TreeUnnamedChildItem = { type: 'unnamed', element: Element }
  type TreeTransformerChildItem = { type: 'transformer', element: Element }
  type TreeChildItem = TreeTextChildItem | TreeDomChildItem | TreeNamedChildItem | TreeUnnamedChildItem | TreeTransformerChildItem
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
  
  const Actions = Object.values(Action)
  
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
  
  enum Function {
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
    REPLACEWITHREF = 'replacewithref',
    TRIM = 'trim',
    SPLIT = 'split',
    /* Array */
    JOIN = 'join',
    AT = 'at',
    MAP = 'map',
    PUSH = 'push',
    /* Utility */
    CLONE = 'clone',
    PRINT = 'print',
    VARIABLE = 'variable',
    CONDITION = 'condition',
    ITERATION = 'iteration',
    
  }

  const Functions = Object.values(Function)
  
  function isFunction (tag: string): tag is Function {
    return Functions.includes(tag as any)
  }

  const functionsAndTypesNamesOverlap = Object
    .values(Function)
    .some(funcName => isType(funcName))
  if (functionsAndTypesNamesOverlap) throw `A function cannot share its name with a type`

  /* ========== HELPERS ========== */

  function isValueNode (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    if (!isType(typeTag) || typeTag === Type.TRANSFORMER) return false
    return true
  }

  function isTransformerNode (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    return typeTag === Type.TRANSFORMER
  }

  function isValueOrTransformerNode (node: Node): node is Element {
    return isValueNode(node) || isTransformerNode(node)
  }

  function isFunctionNode (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const functionTag = node.tagName.toLowerCase()
    return isFunction(functionTag)
  }

  function getTypeFromElement (element: Element): Exclude<Type, Type.DATA> | null {
    if (!isValueOrTransformerNode(element)) return null
    const typeTag = element.tagName.toLowerCase() as Type // if isValueOrTransformerNode(element), then element.tagName is Type
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
  
  function merge (...darkdouilleElements: Element[]) {
    const rootElement = document.createElement('data')
    darkdouilleElements.forEach(darkdouille => {
      const darkdouilleNodes = [...(cloneNode(darkdouille, true)).childNodes]
      rootElement.append(...darkdouilleNodes)
    })
    return reduce(rootElement)
  }

  function reduce (element: Element): Element {
    const childNodes = [...element.childNodes]
    let unnamedChildrenCnt = 0
    const propertiesPathsMap = new Map<string, Element>()
    childNodes.forEach(childNode => {
      const isTextOrElementNode = [Node.TEXT_NODE, Node.ELEMENT_NODE].includes(childNode.nodeType as any)
      if (!isTextOrElementNode) return childNode.parentNode?.removeChild(childNode)
      const isDarkdouilleElement = isValueOrTransformerNode(childNode)
      if (!isDarkdouilleElement) return;
      const type = getTypeFromElement(childNode)
      if (type === Type.TRANSFORMER) return element.appendChild(childNode)
      const localPath = childNode.getAttribute('class') ?? `${unnamedChildrenCnt ++}`
      const existingElement = propertiesPathsMap.get(localPath)
      if (existingElement === undefined) return propertiesPathsMap.set(localPath, childNode)
      childNode.remove()
      if (type !== null) existingElement.setAttribute('type', type)
      const actionAttr = childNode.getAttribute('action')
      if (actionAttr === Action.APPEND) return existingElement.append(...childNode.childNodes)
      if (actionAttr === Action.PREPEND) return existingElement.prepend(...childNode.childNodes)
      return existingElement.replaceChildren(...childNode.childNodes)
    })
    const reducedChildNodes = [...element.childNodes]
    reducedChildNodes.forEach(childNode => {
      const isDarkdouilleElement = isValueOrTransformerNode(childNode)
      if (!isDarkdouilleElement) return;
      const type = getTypeFromElement(childNode)
      if (type === Type.TRANSFORMER) return;
      reduce(childNode)
    })
    return element
  }

  /* ========== TREE ========== */

  export class Tree {
    element: Element
    parent: Tree | undefined
    
    constructor (element: Element, parentTree: Tree | null = null) {
      this.element = element
      this.parent = parentTree ?? undefined
      this.resolve = this.resolve.bind(this)
      this.getFunctionNodeGenerator = this.getFunctionNodeGenerator.bind(this)
      this.getFunctionNodeArguments = this.getFunctionNodeArguments.bind(this)
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

    resolve: TreeResolver = function (this: Tree, path: string) {
      const pathChunks = path
        .split('/')
        .filter(e => e.trim() !== '')
      const startFromRoot = path[0] === '/'
      const startTree = startFromRoot ? this.root : this
      const lol = pathChunks.reduce((prevTree, pathChunk) => {
        if (prevTree === undefined) return undefined
        if (pathChunk === '.') return prevTree
        if (pathChunk === '..') return prevTree.parent
        const { children } = prevTree
        if (children instanceof NodeList) return undefined
        if (Array.isArray(children)) return children[parseInt(pathChunk)]
        return children[pathChunk]
      }, startTree as Tree | undefined)
      return lol
    }

    get type () {
      return getTypeFromElement(this.element)
    }

    get sortedChildren (): TreeChildItem[] {
      const treeNodesOrNull: Array<TreeChildItem | null> = [...this.element.childNodes].map(childNode => {
        if (childNode.nodeType === Node.TEXT_NODE) return { type: 'text', node: childNode }
        if (childNode.nodeType !== Node.ELEMENT_NODE) return null
        const childElement = childNode as Element
        if (!isValueOrTransformerNode(childElement)) return { type: 'dom', element: childElement }
        if (getTypeFromElement(childElement) === Type.TRANSFORMER) return { type: 'transformer', element: childElement }
        const classAttr = childElement.getAttribute('class')
        const isUnnamed = classAttr === null
        if (isUnnamed) return { type: 'unnamed', element: childElement }
        return { type: 'named', element: childElement }
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
      if (children instanceof NodeList) return children
      if (Array.isArray(children)) return children.map(({ value }) => value)
      return Object.keys(children).reduce((record, key) => ({
        ...record,
        [key]: children[key]?.value
      }), {})
    }

    functionNamesToGenerators = new Map<Function, TransformerFunctionGenerator>([
      /* Cast */
      [Function.TOSTRING, toString],
      [Function.TONUMBER, toNumber],
      [Function.TOBOOLEAN, toBoolean],
      [Function.TONULL, toNull],
      [Function.TOHTML, toHtml],
      [Function.TOREF, toRef(this.resolve.bind(this))],
      [Function.TOARRAY, toArray],
      [Function.TORECORD, toRecord],
      
      /* Numbers */
      [Function.ADD, add],
      [Function.SUBTRACT, subtract],
      [Function.MULTIPLY, multiply],
      [Function.DIVIDE, divide],
      [Function.POW, pow],
      [Function.MAX, max],
      [Function.MIN, min],
      [Function.CLAMP, clamp],
      [Function.GREATER, greater],
      [Function.SMALLER, smaller],
      [Function.EQUALS, equals],

      /* Strings */
      [Function.APPEND, append],
      [Function.PREPEND, prepend],
      // [Function.REPLACE, replace],
      // [Function.REPLACEWITHREF, replacewithref],
      // [Function.TRIM, trim],
      // [Function.SPLIT, split],
      
      /* Arrays */
      // [Function.JOIN, join],
      // [Function.AT, at],
      // [Function.MAP, map],
      // [Function.PUSH, push],

      /* Utils */
      [Function.CLONE, clone],
      [Function.PRINT, print],
      // [Function.VARIABLE, variable],
      // [Function.CONDITION, condition],
      // [Function.ITERATION, iteration],
    ])
  
    typeNamesToTransformers = new Map<Type, Transformer>([
      [Type.STRING, toString()],
      [Type.NUMBER, toNumber()],
      [Type.BOOLEAN, toBoolean()],
      [Type.NULL, toNull()],
      [Type.HTML, toHtml()],
      [Type.REF, toRef(this.resolve.bind(this))()],
      [Type.ARRAY, toArray()],
      [Type.RECORD, toRecord()]
    ])

    getFunctionNodeGenerator (
      this: Tree,
      element: Element
    ): TransformerFunctionGenerator | undefined {
      const functionName = element.tagName.toLowerCase()
      const generator = this.functionNamesToGenerators.get(functionName as any)
      return generator
    }

    getFunctionNodeArguments (
      this: Tree,
      element: Element,
      parentTree?: Tree
    ): (TreeValue | Transformer)[] {
      const args = [...element.childNodes].reduce((prevArgs, childNode) => {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const textContent = childNode.textContent?.trim() ?? ''
          return textContent?.length > 0 ? [...prevArgs, textContent] : [...prevArgs]
        }
        if (childNode.nodeType !== Node.ELEMENT_NODE) return [...prevArgs]
        if (isValueOrTransformerNode(childNode)) {
          const t = new Tree(childNode, parentTree).value
          return [...prevArgs, t]
        }
        if (isFunctionNode(childNode)) {
          const generator = this.getFunctionNodeGenerator(childNode)
          if (generator === undefined) return [...prevArgs]
          const args = this.getFunctionNodeArguments(childNode, parentTree)
          const transformer = generator(...args)
          return [...prevArgs, transformer]
        }
        const childNodeWrapper = document.createElement('data')
        childNodeWrapper.append(cloneNode(childNode, true))
        return [...prevArgs, childNodeWrapper.childNodes]
      }, [] as (TreeValue | Transformer)[])
      return args
    }

    get masterTransformer (): Transformer {
      const { element, sortedChildren } = this
      const transformerChildItems = sortedChildren.filter(({ type }) => type === 'transformer') as Array<TreeTransformerChildItem>
      const transformerBlock = transformerChildItems.reduce((block, { element }) => {
        const children = cloneNode(element, true).childNodes
        block.append(...children)
        return block
      }, document.createElement('transformer'))
      const masterTransformer = (input: TreeValue) => {
        const transformersAndValues = this.getFunctionNodeArguments(transformerBlock)
        const transformer = (input: TreeValue) => transformersAndValues.reduce((
          output: TreeValue,
          transformerOrValue) => {
          if (typeof transformerOrValue === 'function') return transformerOrValue(output)
          return transformerOrValue
        }, input)
        const transformed = transformer(input)
        const everyChildIsText = [...element.childNodes].every(node => node.nodeType === Node.TEXT_NODE)
        let type = getTypeFromElement(element)
        if (type === null && everyChildIsText) { type = Type.STRING }
        if (type !== null) {
          const typeTransformer = this.typeNamesToTransformers.get(type)
          if (typeTransformer !== undefined) return typeTransformer(transformed)
        }
        return transformed
      }
      return masterTransformer
    }

    get value (): TreeValue {
      const { untransformedValue, masterTransformer } = this
      return masterTransformer(untransformedValue)
    }
  }

  export function tree (...darkdouilleElements: Element[]) {
    const merged = merge(...darkdouilleElements)
    const tree = new Tree(merged)
    return tree
  }
}
