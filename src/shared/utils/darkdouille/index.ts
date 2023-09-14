import toString from './transformers/toString'
import toNumber from './transformers/toNumber'
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

  type TransformerDescriptor = { name: string, args: string[] }
  type Transformer<T extends TreeValue = TreeValue> = (inputValue: TreeValue) => T
  export type TransformerGenerator<T extends TreeValue = TreeValue> = (...args: TransformerDescriptor['args']) => Transformer<T>


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
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    LMHTML = 'lmhtml',
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

  /* ========== HELPERS ========== */

  function isElement (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    return isType(typeTag)
  }
  
  function getTypeFromElement (element: Element): Exclude<Type, Type.DATA> | null {
    if (!isElement(element)) return null
    const typeTag = element.tagName.toLowerCase() as Type // if isElement(element), then element.tagName is Type
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
      const isDarkdouilleElement = isElement(childNode)
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
      const isDarkdouilleElement = isElement(childNode)
      if (!isDarkdouilleElement) return;
      const type = getTypeFromElement(childNode)
      if (type === Type.TRANSFORMER) return;
      reduce(childNode)
    })
    return element
  }

  /* ========== TRANSFORMERS ========== */

  const namesToTransformerGeneratorsMap = new Map<string, TransformerGenerator>([
    ['toString', toString],
    ['toNumber', toNumber]
  ])

  function transformerFromName (
    name: TransformerDescriptor['name'],
    ...args: TransformerDescriptor['args']): Transformer | undefined {
    const generator = namesToTransformerGeneratorsMap.get(name)
    if (generator === undefined) return undefined
    return generator(...args)
  }

  const typesToTransformerGeneratorsMap = new Map<Type, TransformerGenerator>([
    [Type.TEXT, toString],
    [Type.STRING, toString],
    [Type.NUMBER, toNumber]
  ])

  function transformerFromType (type: Type) {
    const generator = typesToTransformerGeneratorsMap.get(type)
    if (generator === undefined) return undefined
    return generator()
  }

  /* ========== TREE ========== */

  class Tree {
    element: Element
    constructor (element: Element) {
      this.element = element
    }

    get type () {
      return getTypeFromElement(this.element)
    }

    get sortedChildren (): TreeChildItem[] {
      const treeNodesOrNull: Array<TreeChildItem | null> = [...this.element.childNodes].map(childNode => {
        if (childNode.nodeType === Node.TEXT_NODE) return { type: 'text', node: childNode }
        if (childNode.nodeType !== Node.ELEMENT_NODE) return null
        const childElement = childNode as Element
        if (!isElement(childElement)) return { type: 'dom', element: childElement }
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

    get value (): TreeValue {
      const { element, sortedChildren } = this
      const htmlChildItems = sortedChildren.filter(({ type }) => type === 'text' || type === 'dom') as Array<TreeDomChildItem | TreeTextChildItem>
      const unnamedChildItems = sortedChildren.filter(({ type }) => type === 'unnamed') as Array<TreeUnnamedChildItem>
      const namedChildItems = sortedChildren.filter(({ type }) => type === 'named') as Array<TreeNamedChildItem>
      const transformerChildItems = sortedChildren.filter(({ type }) => type === 'transformer') as Array<TreeTransformerChildItem>

      // Raw value
      let rawValue: TreeValue
      if (namedChildItems.length > 0) {
        rawValue = namedChildItems.reduce((record, childItem) => {
          const classAttr = childItem.element.getAttribute('class')
          if (classAttr === null) return record
          return { ...record, [classAttr]: new Tree(childItem.element).value }
        }, {} as { [key: string]: TreeValue })
      } else if (unnamedChildItems.length > 0) {
        rawValue = unnamedChildItems
          .map(childItem => new Tree(childItem.element).value)
      } else  {
        rawValue = htmlChildItems
          .map((childItem) => childItem.type === 'text' ? childItem.node : childItem.element)
          .reduce((fragment, node) => {
            fragment.appendChild(node.cloneNode(true))
            return fragment
          }, document.createDocumentFragment())
          .childNodes
      }

      // Transformers
      const transformerDescriptors: TransformerDescriptor[] = transformerChildItems.map(({ element }) => {
        /* [WIP] could do something to nest transformers, like
         * if nullish ? transformer 1 : transformer 2
         * <transformer>
         *   <data>if</data>
         *   <data>isNullish</data>
         *   <data><data>toString</data></data>
         *   <data><data>toNumber</data></data>
         * </transformer>
         */
        const [firstChild, ...lastChildNodes] = element.childNodes
        if (firstChild === undefined) return undefined
        if (lastChildNodes.length === 0) {
          const [name, ...args] = (firstChild.textContent ?? '').split(/(\s|\r|\n|\t)+/igm)
          if (name === undefined) return undefined
          return { name, args }
        } else {
          const name = firstChild.textContent
          if (name === null) return undefined
          const args = lastChildNodes
            .map(node => node.textContent)
            .filter((textContent): textContent is string => textContent !== null)
          return { name, args }
        }
      }).filter((descriptor): descriptor is TransformerDescriptor => descriptor !== undefined)
      const transformers = transformerDescriptors
        .map(({ name, args }) => transformerFromName(name, ...args))
        .filter((item): item is Transformer => item !== undefined)
      
      // Type
      const type = getTypeFromElement(element)
      if (type !== null) {
        const typeTransformer = transformerFromType(type)
        if (typeTransformer !== undefined) transformers.push(typeTransformer)
      }
      // Return
      const returned = transformers.reduce(
        (val, transformer) => transformer(val),
        rawValue as TreeValue
      )
      return returned
    }
  }

  export function tree (...darkdouilleElements: Element[]) {
    const merged = merge(...darkdouilleElements)
    const tree = new Tree(merged)
    return tree
  }
}
