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

  // MERGE
  // On prend tout les darkdouille dans l'ordre et on les append un par un dans un nouveau data element.
  
  // REDUCE
  // Dans le résultat, on liste les enfants
  // 
  // Pour chaque enfant
  //   si ni text ni element, il disparait
  //   si text, on ne fait rien de plus
  //   si element mais pas transformer ou value, on ne fait rien de plus
  //   si transformer, on déplace l'element tout en bas de son parent et on s'arrête
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
  //   s'il n'est pas une valeur darkdouille (uniquement valeur, pas transformeur), on ne fait rien
  //   sinon, c'est un élément valeur, on lui applique REDUCE

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

  function merge (...darkdouilleElements: Element[]) {
    const rootElement = document.createElement('data')
    darkdouilleElements.forEach(darkdouille => {
      const darkdouilleNodes = [...(cloneNode(darkdouille, true)).childNodes]
      rootElement.append(...darkdouilleNodes)
    })
    return rootElement
  }

  /* ========== TREE ========== */

  export class Tree {
    element: Element
    parent: Tree | undefined
    
    constructor (element: Element, parentTree?: Tree) {
      this.element = element
      this.parent = parentTree ?? undefined
      this.resolve = this.resolve.bind(this)
      this.getFunctionNodeGenerator = this.getFunctionNodeGenerator.bind(this)
      this.getFunctionNodeArguments = this.getFunctionNodeArguments.bind(this)
      this.getTransformerFromTypeName = this.getTransformerFromTypeName.bind(this)
      this.getGeneratorFromFunctionName = this.getGeneratorFromFunctionName.bind(this)
      // console.group('tree.constructor', this.elementStr)
      // console.log('parentTree\n', parentTree?.elementStr)
      // console.groupEnd()
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

    resolve: TreeResolver = function (this: Tree, path: string) {
      // console.group('tree.resolve', this.elementStr)
      const pathChunks = path
        .split('/')
        .filter(e => e.trim() !== '')
      const startFromRoot = path[0] === '/'
      const startTree = startFromRoot ? this.root : this
      // console.log('path', path)
      // console.log('this', this)
      // console.log('startTree', startTree)
      const returned = pathChunks.reduce((prevTree, pathChunk) => {
        if (prevTree === undefined) return undefined
        if (pathChunk === '.') return prevTree
        if (pathChunk === '..') return prevTree.parent
        const { children } = prevTree
        if (children instanceof NodeList) return undefined
        if (Array.isArray(children)) return children[parseInt(pathChunk)]
        return children[pathChunk]
      }, startTree as Tree | undefined)
      // console.log('returned', returned)
      // console.groupEnd()
      return returned
    }

    get type () {
      return getTypeFromElement(this.element)
    }

    get sortedChildren (): TreeChildItem[] {
      // console.group('tree.sortedChildren', this.elementStr)
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
      // console.log(treeNodes.map(node => {
      //   if (node.type === 'text') return `text / ${node.node.textContent ?? ''}`
      //   const clone = node.element.cloneNode() as Element
      //   return `${node.type} / ${clone.outerHTML}`
      // }).join('\n'))
      // console.groupEnd()
      return treeNodes
    }

    get children (): NodeListOf<Node> | { [key: string]: Tree } | Tree[] {
      // console.group('tree.children', this.elementStr)
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
      // console.log(children)
      // console.groupEnd()
      return children
    }

    get untransformedValue (): TreeValue {
      // console.group('tree.untransformedValue', this.elementStr)
      const { children } = this
      if (children instanceof NodeList) {
        const allTextNodes = [...children].every(node => node.nodeType === Node.TEXT_NODE)
        if (allTextNodes) {
          const returned = [...children]
            .map(child => child.textContent ?? '')
            .join('')
          // console.log(returned)
          // console.groupEnd()
          return returned
        }
        // console.log(children)
        // console.groupEnd()
        return children
      }
      if (Array.isArray(children)) {
        const returned = children.map(({ value }) => value)
        // console.log(returned)
        // console.groupEnd()
        return returned
      }
      const returned = Object.keys(children).reduce((record, key) => ({
        ...record,
        [key]: children[key]?.value
      }), {})
      // console.log(returned)
      // console.groupEnd()
      return returned
    }

    getGeneratorFromFunctionName (this: Tree, name: Function): TransformerFunctionGenerator {
      /* Cast */
      if (name === Function.TOSTRING) return toString
      if (name === Function.TONUMBER) return toNumber
      if (name === Function.TOBOOLEAN) return toBoolean
      if (name === Function.TONULL) return toNull
      if (name === Function.TOHTML) return toHtml
      if (name === Function.TOREF) {
        console.log('giving to you the toRef generator', this.elementStr, this)
        return toRef(this.resolve.bind(this))
      }
      if (name === Function.TOARRAY) return toArray
      if (name === Function.TORECORD) return toRecord
      
      /* Numbers */
      if (name === Function.ADD) return add
      if (name === Function.SUBTRACT) return subtract
      if (name === Function.MULTIPLY) return multiply
      if (name === Function.DIVIDE) return divide
      if (name === Function.POW) return pow
      if (name === Function.MAX) return max
      if (name === Function.MIN) return min
      if (name === Function.CLAMP) return clamp
      if (name === Function.GREATER) return greater
      if (name === Function.SMALLER) return smaller
      if (name === Function.EQUALS) return equals

      /* Strings */
      if (name === Function.APPEND) return append
      if (name === Function.PREPEND) return prepend
      if (name === Function.REPLACE) return replace
      // if (name === Function.REPLACEWITHREF) return replacewithref
      // if (name === Function.TRIM) return trim
      // if (name === Function.SPLIT) return split
      
      /* Arrays */
      // if (name === Function.JOIN) return join
      // if (name === Function.AT) return at
      // if (name === Function.MAP) return map
      // if (name === Function.PUSH) return push

      /* Utils */
      if (name === Function.CLONE) return clone
      if (name === Function.PRINT) return print
      // if (name === Function.VARIABLE) return variable
      // if (name === Function.CONDITION) return condition
      // if (name === Function.ITERATION) return iteration
      return () => input => input
    }

    getTransformerFromTypeName (this: Tree, type: Type): Transformer {
      if (type === Type.STRING) return toString()
      if (type === Type.NUMBER) return toNumber()
      if (type === Type.BOOLEAN) return toBoolean()
      if (type === Type.NULL) return toNull()
      if (type === Type.HTML) return toHtml()
      if (type === Type.REF) {
        console.log('giving to you the toRef function', this.elementStr, this.parent)
        return toRef(this.resolve.bind(this))()
      }
      if (type === Type.ARRAY) return toArray()
      if (type === Type.RECORD) return toRecord()
      return input => input
    }

    getFunctionNodeGenerator (
      this: Tree,
      element: Element
    ): TransformerFunctionGenerator | undefined {
      const functionName = element.tagName.toLowerCase()
      const generator = this.getGeneratorFromFunctionName(functionName as any)
      return generator
    }

    getFunctionNodeArguments (
      this: Tree,
      element: Element,
    ): (TreeValue | Transformer)[] {
      const args = [...element.childNodes].reduce((prevArgs, childNode) => {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const textContent = childNode.textContent?.trim() ?? ''
          return textContent?.length > 0 ? [...prevArgs, textContent] : [...prevArgs]
        }
        if (childNode.nodeType !== Node.ELEMENT_NODE) return [...prevArgs]
        if (isValueOrTransformerNode(childNode)) {
          console.log(this.elementStr, element, childNode, 'is value or transformer node. Context', this)
          if (childNode.tagName === 'REF') {
            console.error('!!!!!')
          }
          const treeValue = new Tree(childNode, this.parent).value
          return [...prevArgs, treeValue]
        }
        if (isFunctionNode(childNode)) { 
          console.log(this.elementStr, element, childNode, 'is function node. Context:', this)
          const generator = this.getFunctionNodeGenerator(childNode)
          
          if (generator === undefined) return [...prevArgs]
          const args = this.getFunctionNodeArguments(childNode)
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
      console.group('tree.masterTransformer - factory', this.elementStr)
      const { element, sortedChildren } = this
      const transformerChildItems = sortedChildren.filter(({ type }) => type === 'transformer') as Array<TreeTransformerChildItem>
      const transformerBlock = transformerChildItems.reduce((block, { element }) => {
        const children = cloneNode(element, true).childNodes
        block.append(...children)
        return block
      }, document.createElement('transformer'))
      const masterTransformer = (input: TreeValue) => {
        console.group('tree.masterTransformer', this.elementStr)
        const transformersAndValues = this.getFunctionNodeArguments(transformerBlock)
        const transformer = (input: TreeValue) => transformersAndValues.reduce((
          output: TreeValue,
          transformerOrValue) => {
          if (typeof transformerOrValue === 'function') {
            const transformed = transformerOrValue(output)
            console.log('input', output)
            console.log('transformed', transformed)
            return transformed
          }
          return transformerOrValue
        }, input)
        const transformed = transformer(input)
        const everyChildIsText = [...element.childNodes].every(node => node.nodeType === Node.TEXT_NODE)
        let type = getTypeFromElement(element)
        if (type === null && everyChildIsText) { type = Type.STRING }
        if (type !== null) {
          const typeTransformer = this.getTransformerFromTypeName(type)
          console.log('type transformer', this.getTransformerFromTypeName(type))
          console.groupEnd()
          if (typeTransformer !== undefined) return typeTransformer(transformed)
        }
        console.groupEnd()
        return transformed
      }
      console.groupEnd()
      return masterTransformer
    }

    get value (): TreeValue {
      console.group('tree.value', this.elementStr)
      const { untransformedValue, masterTransformer } = this
      const returned = masterTransformer(untransformedValue)
      console.log('value:', returned)
      console.groupEnd()
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
