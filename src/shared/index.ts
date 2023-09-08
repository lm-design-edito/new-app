namespace Darkdouille {
//   export enum NodeType { ELEMENT, TEXT }
  export enum Action {
    APPEND = 'append',
    PREPEND = 'prepend',
    OVERWRITE = 'overwrite',
    MERGE = 'merge'
  }
  export const Actions = Object.values(Action)
  export enum Type {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    LMHTML = 'lmhtml',
    REF = 'ref',
    DATA = 'data',
    TRANSFORMER = 'transformer'
  }
  export const Types = Object.values(Type)
  export function isType (tag: string): tag is Type {
    return Types.includes(tag as any)
  }
}

const darkdouilles = document.body.querySelectorAll('data.lm-page-config') as NodeListOf<HTMLDataElement>
const merged = mergeDarkdouilles(...darkdouilles)

/*
Nœud d'entrée
  - Pour chaque nœud enfant :
    - si texte, on y touche pas
    - si dom, on y touche pas
    - si transformer : on le passe à la fin
    - si prop
      - on détermine son chemin local
      - on regarde si un data element a déjà été stocké à ce niveau
        - si oui
          - si action === APPEND
            - on ajoute tous ses enfants à la fin du nœud stocké
          - si action === PREPEND
            - on ajoute tous ses enfants au début du nœud stocké
          - si action === MERGE
            - ???
          - si action === OVERWRITE ou NULL
            - on supprime tous les enfants du nœud stocké et on les remplace par celui là
        - si non
          - on stocke ce data element à ce chemin

  - Le nœud d'entrée a été réorganisé
  - Pour chaque nœud enfant de type prop
    - recurse

*/

function mergeDarkdouilles (...darkdouilles: HTMLDataElement[]) {
  const rootElement = document.createElement('data')
  darkdouilles.forEach(darkdouille => {
    darkdouille.remove()
    const darkdouilleNodes = [...darkdouille.childNodes]
    rootElement.append(...darkdouilleNodes)
  })
  magic(rootElement)
  console.log(rootElement.outerHTML)
  // rootElement.append(...darkdouilles)
  // const tree = createDataTree(rootElement)
  // const solved = solveDataTree(tree)
  // printSolvedTree(solved)
  // return rootElement
}

function magic (element: Element): Element {
  let unnamedChildrenCnt = 0
  const childNodes = [...element.childNodes]
  const propertiesPathsMap = new Map<string, Element>()
  childNodes.forEach(childNode => {
    const isTextOrElementNode = [Node.TEXT_NODE, Node.ELEMENT_NODE].includes(childNode.nodeType as any)
    if (!isTextOrElementNode) return childNode.parentNode?.removeChild(childNode)
    const isElement = childNode instanceof Element
    if (!isElement) return;
    const typeTag = childNode.tagName.toLowerCase()
    if (!Darkdouille.isType(typeTag)) return;
    const typeAttr = childNode.getAttribute('type')
    let type: Exclude<Darkdouille.Type, Darkdouille.Type.DATA> | null
    if (typeAttr !== null && Darkdouille.isType(typeAttr) && typeAttr !== Darkdouille.Type.DATA) { type = typeAttr }
    else if (Darkdouille.isType(typeTag) && typeTag !== Darkdouille.Type.DATA) { type = typeTag }
    else { type = null }
    if (type === Darkdouille.Type.TRANSFORMER) return element.appendChild(childNode)
    const localPath = childNode.getAttribute('class') ?? `${unnamedChildrenCnt ++}`
    const existingElement = propertiesPathsMap.get(localPath)
    if (existingElement === undefined) return propertiesPathsMap.set(localPath, childNode);
    childNode.remove()
    if (Darkdouille.Types.includes(type as any)) existingElement.setAttribute('type', type as Darkdouille.Type)
    const actionAttr = childNode.getAttribute('action')
    if (actionAttr === Darkdouille.Action.APPEND) return existingElement.append(...childNode.childNodes)
    if (actionAttr === Darkdouille.Action.PREPEND) return existingElement.prepend(...childNode.childNodes)
    return existingElement.replaceChildren(...childNode.childNodes)
  })
  childNodes.forEach(childNode => {
    const isElement = childNode instanceof Element
    if (!isElement) return;
    const typeTag = childNode.tagName.toLowerCase()
    if (!Darkdouille.isType(typeTag)) return;
    const typeAttr = childNode.getAttribute('type')
    let type: Exclude<Darkdouille.Type, Darkdouille.Type.DATA> | null
    if (typeAttr !== null && Darkdouille.isType(typeAttr) && typeAttr !== Darkdouille.Type.DATA) { type = typeAttr }
    else if (Darkdouille.isType(typeTag) && typeTag !== Darkdouille.Type.DATA) { type = typeTag }
    else { type = null }
    if (type === Darkdouille.Type.TRANSFORMER) return;
    magic(childNode)
  })
  return element
}


/* function printSolvedTree (solvedTree: SolvedTree) {
  solvedTree.forEach((value, key) => {
    console.group(key)
    console.log('type:', value.type)
    console.log('transformers:', value.transformers)
    console.log('node:', value.node.outerHTML)
    printSolvedTree(value.subTree)
    console.groupEnd()
  })
}

enum TreeItemType {
  TEXT = 'text',
  DOM = 'dom',
  TRANSFORMER = 'transformer',
  PROPERTY = 'property'
}
type TreeTextItem = { type: TreeItemType.TEXT, node: Node }
type TreeDomItem = { type: TreeItemType.DOM, node: Element }
type TreeTransformerItem = { type: TreeItemType.TRANSFORMER, node: Element }
type TreePropertyItem = {
  type: TreeItemType.PROPERTY,
  relPath: string | number,
  returnType: Darkdouille.Type | null,
  action: Darkdouille.Action | null,
  node: Element,
  tree: Tree
}
type TreeItem = TreeTextItem | TreeDomItem | TreeTransformerItem | TreePropertyItem
type Tree = TreeItem[]

function createDataTree (element: HTMLDataElement): Tree {
  // Children
  let unnamedChildrenCnt = 0
  const childNodes = [...element.childNodes]  
  const tree: Tree = childNodes.map(childNode => {
    if (childNode.nodeType === Node.TEXT_NODE) return {
      type: TreeItemType.TEXT,
      node: childNode
    } as TreeTextItem
    else if (childNode.nodeType === Node.ELEMENT_NODE) {
      const childElement = childNode as Element
      if (!(childElement instanceof HTMLDataElement)) return {
        type: TreeItemType.DOM,
        node: childElement
      } as TreeDomItem
      // Type
      const typeAttr = childElement.getAttribute('type')
      const type = Darkdouille.Types.includes(typeAttr as any)
        ? typeAttr as Darkdouille.Type
        : null
      if (type === Darkdouille.Type.TRANSFORMER) return {
        type: TreeItemType.TRANSFORMER,
        node: childElement
      } as TreeTransformerItem
      // Class & path
      const classAttr = childElement.getAttribute('class')
      const relPath = classAttr ?? unnamedChildrenCnt++
      // Action
      const actionAttr = childElement.getAttribute('action')
      const action = Darkdouille.Actions.includes(actionAttr as any)
        ? actionAttr as Darkdouille.Action
        : null  
      return {
        type: TreeItemType.PROPERTY,
        relPath,
        returnType: type,
        action,
        node: childElement,
        tree: createDataTree(childElement)
      } as TreePropertyItem
    } else return undefined
  }).filter((item): item is TreeItem => item !== undefined)
  return tree
}

type TransformerDescriptor = { name: string, args: string[] }

type SolvedTreePathChunk = (string | number)
type SolvedTreePath = SolvedTreePathChunk[]
type SolvedTreeBranchValue = {
  transformers: TransformerDescriptor[]
  type: Darkdouille.Type | null
  node: Element,
  subTree: SolvedTree
}
type SolvedTree = Map<SolvedTreePathChunk, SolvedTreeBranchValue>

function generateEmptySolvedTreeBranchValue (subTree: SolvedTree = new Map()): SolvedTreeBranchValue {
  return {
    transformers: [],
    type: null,
    node: document.createElement('data'),
    subTree
  }
}

function resolveInSolvedTree (
  path: SolvedTreePath,
  solvedTree: SolvedTree,
  create: true): SolvedTreeBranchValue
function resolveInSolvedTree (
  path: SolvedTreePath,
  solvedTree: SolvedTree,
  create: false): SolvedTreeBranchValue | undefined
function resolveInSolvedTree (
  path: SolvedTreePath,
  solvedTree: SolvedTree): SolvedTreeBranchValue | undefined
function resolveInSolvedTree (
  path: SolvedTreePath,
  solvedTree: SolvedTree,
  create: boolean = false): SolvedTreeBranchValue | undefined {
  if (create === true) {
    const resolved = path.reduce((branchValue, pathChunk) => {
      const subBranch = branchValue.subTree.get(pathChunk)
      if (subBranch === undefined) {
        const newSubBranch = generateEmptySolvedTreeBranchValue()
        branchValue.subTree.set(pathChunk, newSubBranch)
        return newSubBranch
      }
      return subBranch
    }, generateEmptySolvedTreeBranchValue(solvedTree) as SolvedTreeBranchValue)
    return resolved  
  }
  const resolved = path.reduce((branchValue, pathChunk) => {
    if (branchValue === undefined) return;
    const subBranch = branchValue.subTree.get(pathChunk)
    return subBranch
  }, generateEmptySolvedTreeBranchValue(solvedTree) as SolvedTreeBranchValue | undefined)
  return resolved
}

// type SolvedTreeBranchValue = {
//   transformers: TransformerDescriptor[]
//   type: Darkdouille.Type | null
//   node: Element | null,
//   subTree: SolvedTree
// }

function solveDataTree (
  tree: Tree,
  path: SolvedTreePath = ['ROOT'],
  action: Darkdouille.Action | null = null,
  solvedTree: SolvedTree = new Map([['ROOT', generateEmptySolvedTreeBranchValue()]])
): SolvedTree {
  const currentBranch = resolveInSolvedTree(path, solvedTree, true)
  const { transformers, type, node, subTree } = currentBranch
  const transformerItems = tree.filter((item): item is TreeTransformerItem => item.type === TreeItemType.TRANSFORMER)
  const textItems = tree.filter((item): item is TreeTextItem => item.type === TreeItemType.TEXT)
  const domItems = tree.filter((item): item is TreeDomItem => item.type === TreeItemType.DOM)
  const propItems = tree.filter((item): item is TreePropertyItem => item.type === TreeItemType.PROPERTY)

  // Transformers
  transformerItems.forEach(item => item.node.remove())
  const transformersDescriptors: TransformerDescriptor[] = transformerItems.map(transformerItem => {
    const childNodes = [...transformerItem.node.childNodes]
    const hasOnlyATextNodeChild = childNodes.length === 1 && childNodes
      .every(({ nodeType }) => nodeType === Node.TEXT_NODE)
    if (hasOnlyATextNodeChild) {
      const strChildNode = childNodes[0]?.textContent ?? ''
      const [name = '', ...args] = strChildNode.trim().replace(/\s+/igm, ' ').split(' ')
      return { name, args } 
    }
    const [name = '', ...args] = childNodes.map(childNode => childNode.textContent ?? '')
    return { name, args }
  })
  if (action === Darkdouille.Action.APPEND) transformers.push(...transformersDescriptors)
  else if (action === Darkdouille.Action.MERGE) {
    // Maybe overkill, and acts different from textItems and domItems
    const newTransformers = [
      ...transformersDescriptors,
      ...transformers.slice(transformersDescriptors.length)
    ]
    transformers.splice(0, newTransformers.length, ...newTransformers)
  }
  else if (action === Darkdouille.Action.PREPEND) transformers.unshift(...transformersDescriptors)
  else transformers.splice(0, transformers.length, ...transformersDescriptors)
  
  // Text
  if (action === Darkdouille.Action.APPEND
    || action === Darkdouille.Action.MERGE) {
    node.append(...textItems.map(textItem => textItem.node))
  } else if (action === Darkdouille.Action.PREPEND) {
    node.prepend(...textItems.map(textItem => textItem.node))
  } else {
    node.replaceChildren(...textItems.map(textItem => textItem.node))
  }

  // Dom
  if (action === Darkdouille.Action.APPEND
    || action === Darkdouille.Action.MERGE) {
    node.append(...domItems.map(domItem => domItem.node))
  } else if (action === Darkdouille.Action.PREPEND) {
    node.prepend(...domItems.map(domItem => domItem.node))
  } else {
    node.replaceChildren(...domItems.map(domItem => domItem.node))
  }
  
  // Property
  propItems.forEach(propItem => {
    // action
    // tree
    propItem.node.remove()
    const propItemPath = [...path, propItem.relPath]
    const propItemBranch = resolveInSolvedTree(propItemPath, solvedTree, true)
    propItemBranch.type = propItem.returnType
    solveDataTree(propItem.tree, propItemPath, propItem.action, solvedTree)
  })
  // if (action === Darkdouille.Action.APPEND) {
  //   currentBranch.node.append(...domItems.map(domItem => domItem.node))
  // } else if (action === Darkdouille.Action.MERGE) {
    
  // } else if (action === Darkdouille.Action.PREPEND) {
  //   currentBranch.node.prepend(...domItems.map(domItem => domItem.node))
  // } else {
  //   currentBranch.node.replaceChildren(...domItems.map(domItem => domItem.node))
  // }

  // tree.forEach(treeItem => {
  //   if (treeItem.type === TreeItemType.TEXT) {
  //     console.log('what to do with text ?', treeItem)
  //   } else if (treeItem.type === TreeItemType.DOM) {
  //     console.log('what to do with dom ?', treeItem)
  //   } else if (treeItem.type === TreeItemType.TRANSFORMER) {
  //     const childNodes = [...treeItem.node.childNodes]
  //     const hasOnlyATextNodeChild = childNodes.length === 1 &&
  //       childNodes.every(childNode => childNode.nodeType === Node.TEXT_NODE)
  //     if (hasOnlyATextNodeChild) {
  //       const strChildNode = childNodes[0]?.textContent ?? ''
  //       const [name = '', ...args] = strChildNode.trim().replace(/\s+/igm, ' ').split(' ')
        
  //     }
  //   } else {
  //     // const { action, relPath, returnType, node, tree } = treeItem

  //   }
  // })
  return solvedTree
}

// function getElementChildrenPaths (element: HTMLDataElement): {
//   childrenPathMap: Map<string | number, HTMLDataElement>
//   transformers: HTMLDataElement[]
//  } {
//   let unnamedChildrenCnt = 0
//   const childrenPathMap = new Map<string | number, HTMLDataElement>()
//   const transformers: HTMLDataElement[] = []
//   const nodeChildren = [...element.childNodes]
//   nodeChildren.forEach(childNode => {
//     // const isDataElement = childNode instanceof HTMLDataElement
//     // if (!isDataElement) return;
//     // const childDataElement = childNode
//     // // Type
//     // const typeAttr = childDataElement.getAttribute('type')
//     // if (typeAttr === Darkdouille.Type.TRANSFORMER) {
//     //   // [WIP] take into account action here
//     //   elementTransformers.push(childDataElement)
//     //   childDataElement.remove()
//     //   return;
//     // }
//     // const type = Darkdouille.Types.includes(typeAttr as any) ? typeAttr as Darkdouille.Type : null
//     // // Class & path
//     // const classAttr = childDataElement.getAttribute('class')
//     // const thisNodePathChunk = classAttr ?? unnamedChildrenCnt++
//     // const thisNodeFullPath = [...path, thisNodePathChunk]
//     // const thisNodeStrFullPath = thisNodeFullPath.map(e => e.toString()).join('/')
//     // const elementAtThisPath = pathsMap.get(thisNodeStrFullPath)
//   })
//   return { childrenPathMap, transformers }
// }

function representElement (
  element: HTMLDataElement,
  path: Array<string | number>,
  pathsMap: Map<string, HTMLDataElement>
) {
  let unnamedChildrenCnt = 0
  const elementTransformers: HTMLDataElement[] = []
  const childrenBeforeAction = [...element.childNodes]
  // Apply action properties
  childrenBeforeAction.forEach(childNode => {
    const isDataElement = childNode instanceof HTMLDataElement
    if (!isDataElement) return;
    const childDataElement = childNode
    // Type
    const typeAttr = childDataElement.getAttribute('type')
    if (typeAttr === Darkdouille.Type.TRANSFORMER) {
      // [WIP] take into account action here
      elementTransformers.push(childDataElement)
      childDataElement.remove()
      return;
    }
    const type = Darkdouille.Types.includes(typeAttr as any) ? typeAttr as Darkdouille.Type : null
    // Class & path
    const classAttr = childDataElement.getAttribute('class')
    const thisNodePathChunk = classAttr ?? unnamedChildrenCnt++
    const thisNodeFullPath = [...path, thisNodePathChunk]
    const thisNodeStrFullPath = thisNodeFullPath.map(e => e.toString()).join('/')
    const elementAtThisPath = pathsMap.get(thisNodeStrFullPath)
    // Action
    const actionAttr = childDataElement.getAttribute('action')
    const action = Darkdouille.Actions.includes(actionAttr as any) ? actionAttr as Darkdouille.Action : null
    childDataElement.removeAttribute('action')
    if (elementAtThisPath === undefined) pathsMap.set(thisNodeStrFullPath, childDataElement)
    else {
      if (type !== null) { elementAtThisPath.setAttribute('type', type) }
      const grandChildrenNodes = [...childDataElement.childNodes]
      // Prepend
      if (action === Darkdouille.Action.PREPEND) {
        elementAtThisPath.prepend(...grandChildrenNodes)
        childDataElement.remove()
      // Append
      } else if (action === Darkdouille.Action.APPEND) {
        elementAtThisPath.append(...grandChildrenNodes)
        childDataElement.remove()
      // Merge
      } else if (action === Darkdouille.Action.MERGE) {
        console.log('gotta merge')
        console.log('base', elementAtThisPath.innerHTML)
        console.log('to merge', childDataElement.innerHTML)
        

        representElement(
          childDataElement,
          thisNodeFullPath,
          pathsMap
        )
      // Overwrite
      } else {
        elementAtThisPath.replaceChildren(...grandChildrenNodes)
      }
    }
  })
  // Apply action properties
  const childrenAfterAction = [...element.childNodes]
  childrenAfterAction.forEach(childNode => {
    const isDataElement = childNode instanceof HTMLDataElement
    if (!isDataElement) return;
    const childDataElement = childNode
    // Class & path
    const classAttr = childDataElement.getAttribute('class')
    const thisNodePathChunk = classAttr ?? unnamedChildrenCnt++
    const thisNodeFullPath = [...path, thisNodePathChunk]
    representElement(
      childDataElement,
      thisNodeFullPath,
      pathsMap
    )
  })
  
  // Re-add transformers at the end of the element
  element.append(...elementTransformers)
}

*/
