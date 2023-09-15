import toString from './transformers/toString'
import toNumber from './transformers/toNumber'
import toBoolean from './transformers/toBoolean'
import toNull from './transformers/toNull'

export namespace Darkdouille {

  type TreeTextChildItem = { type: 'text', node: Node }
  type TreeDomChildItem = { type: 'dom', element: Element }
  type TreeNamedChildItem = { type: 'named', element: Element }
  type TreeUnnamedChildItem = { type: 'unnamed', element: Element }
  type TreeTransformerChildItem = { type: 'transformer', element: Element }
  type TreeChildItem = TreeTextChildItem | TreeDomChildItem | TreeNamedChildItem | TreeUnnamedChildItem | TreeTransformerChildItem
  type TreePrimitiveValue = string | number | boolean | null | undefined | NodeListOf<Node>
  type TreeValue = TreePrimitiveValue | TreeValue[] | { [key: string]: TreeValue }
  type TreeResolver = (path: string) => TreeValue

  type Transformer<T extends TreeValue = TreeValue> = (input: TreeValue) => T
  export type TransformerFunctionGenerator<T extends TreeValue = TreeValue> = (/*resolver: TreeResolver, */...args: (TreeValue | Transformer)[]) => Transformer<T>


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
    LMHTML = 'lm-html',
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
    TOSTRING = 'tostring',
    TONUMBER = 'tonumber',
    TOBOOLEAN = 'toboolean',
    TONULL = 'tonull',
    TOREF = 'toref'
    
    
    
    
    
    // TOARRAY = 'toarray',
    // PRINT = 'print',
    // VAR = 'var',
    // MAP = 'map',
    // ADD = 'add',
    // MULTIPLY = 'multiply',
    // IF = 'if',
    // GREATERTHAN = 'greaterThan',
    // DIVIDE = 'divide',
    // MULTIPARAM = 'multiparam'
  }

  const functionNamesToGenerators = new Map<Function, TransformerFunctionGenerator>([
    [Function.TOSTRING, toString],
    [Function.TONUMBER, toNumber],
    [Function.TOBOOLEAN, toBoolean],
    [Function.TONULL, toNull]
  ])

  const typeNamesToTransformers = new Map<Type, Transformer>([
    [Type.STRING, toString()],
    [Type.NUMBER, toNumber()],
    [Type.BOOLEAN, toBoolean()],
    [Type.NULL, toNull()]
  ])

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

  /* ========== TRANSFORMERS ========== */

  function getFunctionNodeGenerator (element: Element): TransformerFunctionGenerator | undefined {
    const functionName = element.tagName.toLowerCase()
    const generator = functionNamesToGenerators.get(functionName as any)
    return generator
  }

  function getFunctionNodeArguments (
    element: Element,
    parentTree?: Tree
  ): (TreeValue | Transformer)[] {
    const args = [...element.childNodes].reduce((children, childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        const textContent = childNode.textContent?.trim() ?? ''
        return textContent?.length > 0 ? [...children, textContent] : [...children]
      }
      if (childNode.nodeType !== Node.ELEMENT_NODE) return [...children]
      if (isValueOrTransformerNode(childNode)) {
        const t = new Tree(childNode, parentTree).value
        return [...children, t]
      }
      if (isFunctionNode(childNode)) {
        const generator = getFunctionNodeGenerator(childNode)
        if (generator === undefined) return [...children]
        const args = getFunctionNodeArguments(childNode)
        const transformer = generator(...args)
        return [...children, transformer]
      }
      const childNodeWrapper = document.createElement('data')
      childNodeWrapper.append(cloneNode(childNode, true))
      return [...children, childNodeWrapper.childNodes]
    }, [] as (TreeValue | Transformer)[])
    return args
  }

  /* ========== TREE ========== */

  class Tree {
    element: Element
    parent: Tree | undefined
    
    constructor (element: Element, parentTree: Tree | null = null) {
      this.element = element
      this.parent = parentTree ?? undefined
      this.resolve = this.resolve.bind(this)
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

    resolve: TreeResolver = function (
      this: Tree,
      path: string,
      previouslyResolved?: Tree[]) {
      const pathChunks = path.split('/')
      // const lol: Tree | undefined = pathChunks.reduce((prevTree, pathChunk) => {
      //   if (pathChunk)
      // }, this as Tree | undefined)
      // const lol: Tree | undefined = pathChunks.reduce((prevTree, pathChunk) => {
      //   return prevTree
      // }, this as Tree)
      return path
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

    get rawValue (): TreeValue {
      const { sortedChildren } = this
      const htmlChildItems = sortedChildren.filter(({ type }) => type === 'text' || type === 'dom') as Array<TreeDomChildItem | TreeTextChildItem>
      const unnamedChildItems = sortedChildren.filter(({ type }) => type === 'unnamed') as Array<TreeUnnamedChildItem>
      const namedChildItems = sortedChildren.filter(({ type }) => type === 'named') as Array<TreeNamedChildItem>
      let rawValue: TreeValue
      if (namedChildItems.length > 0) {
        rawValue = namedChildItems.reduce((record, childItem) => {
          const classAttr = childItem.element.getAttribute('class')
          if (classAttr === null) return record
          return { ...record, [classAttr]: new Tree(childItem.element, this).value }
        }, {} as { [key: string]: TreeValue })
      } else if (unnamedChildItems.length > 0) {
        rawValue = unnamedChildItems
          .map(childItem => new Tree(childItem.element, this).value)
      } else  {
        rawValue = htmlChildItems
          .map((childItem) => childItem.type === 'text' ? childItem.node : childItem.element)
          .reduce((fragment, node) => {
            fragment.appendChild(node.cloneNode(true))
            return fragment
          }, document.createDocumentFragment())
          .childNodes
      }
      return rawValue
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
        const transformersAndValues = getFunctionNodeArguments(transformerBlock, this.parent)
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
          const typeTransformer = typeNamesToTransformers.get(type)
          if (typeTransformer !== undefined) return typeTransformer(transformed)
        }
        return transformed
      }
      return masterTransformer
    }

    get value (): TreeValue {
      const { rawValue, masterTransformer } = this
      return masterTransformer(rawValue)
    }
  }

  export function tree (...darkdouilleElements: Element[]) {
    const merged = merge(...darkdouilleElements)
    const tree = new Tree(merged)
    return tree
  }
}
