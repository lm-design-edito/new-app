namespace Darkdouille {
//   export enum NodeType { ELEMENT, TEXT }
  export enum Action {
    APPEND = 'append',
    PREPEND = 'prepend',
    OVERWRITE = 'overwrite'
  }
  export const Actions = Object.values(Action)
  export enum Type {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    HTML = 'html',
    LMHTML = 'lm-html',
    REF = 'ref',
    ARRAY = 'list',
    RECORD = 'record',
    TRANSFORMER = 'transformer'
  }
  export const Types = Object.values(Type)
//   export type TransformerDescriptor = { name: string, arguments: string[] }
//   export type NodeDataNamedChild = { type: 'named', key: string, data: NodeData }
//   export type NodeDataUnnamedChild = { type: 'unnamed', key: number, data: NodeData }
//   export type NodeDataChild = NodeDataNamedChild | NodeDataUnnamedChild
//   export type NodeData = {
//     node: Node
//     action: Darkdouille.Action | null
//     type: Darkdouille.Type | null
//     transformers: TransformerDescriptor[]
//     children: Array<NodeDataChild>
//   }
//   export type MergedNodeData = Omit<NodeData, 'action' | 'children'> & {
//     children: Map<string | number, MergedNodeData>
//   }
}

// const darkdouilles = document.body.querySelectorAll('.lm-page-config')
// const parsedList = [...darkdouilles].map(darkdouille => {
//   return parseDarkdouille(darkdouille)
// }).filter((e): e is DarkdouilleNodeData => e !== undefined)
// const merged = parsedList.reduce((
//   mergedAcc: MergedDarkdouilleNodeData | null,
//   parsed: DarkdouilleNodeData) => {
//   return mergeDarkdouilleData(
//     parsed,
//     [],
//     mergedAcc ?? undefined
//   )
// }, null)
// console.log(merged)

// function parseDarkdouille (element: Element) {
//   const result = parseDarkdouilleNode(element)
//   return result
// }

// function parseDarkdouilleNode (node: Node): Darkdouille.NodeData | undefined {
//   const { nodeType } = node
  
//   // Text node
//   if (nodeType === Node.TEXT_NODE) return {
//     node,
//     action: null,
//     type: null,
//     transformers: [],
//     children: []
//   }
  
//   // Anything but Element node
//   if (nodeType !== Node.ELEMENT_NODE) return undefined
  
//   // Element node
//   const element = node as Element
//   const _action = element.getAttribute('action')
//   const action = Darkdouille.Actions.includes(_action as any) ? _action as Darkdouille.Action : null
//   const _type = element.getAttribute('type')
//   const type = Darkdouille.Types.includes(_type as any) ? _type as Darkdouille.Type : null
//   const transformersNodes = element.querySelectorAll('[type="transformer"]')
//   const transformers = parseDarkdouilleTransformers(transformersNodes)
//   let unnamedChildrenCnt = 0
//   const children: Array<Darkdouille.NodeDataChild> = [...element.childNodes]
//     .filter(child => ![...transformersNodes].includes(child as Element))
//     .map(child => {
//       const childData = parseDarkdouilleNode(child)
//       if (childData === undefined) return;
//       if (childData.node.nodeType === Node.TEXT_NODE) return {
//         type: 'unnamed',
//         key: unnamedChildrenCnt++,
//         data: childData
//       }
//       const { node } = childData
//       if (!(node instanceof Element)) return;
//       const key = node.getAttribute('class')
//       if (key !== null) return {
//         type: 'named',
//         key,
//         data: childData
//       }
//       return {
//         type: 'unnamed',
//         key: unnamedChildrenCnt++,
//         data: childData
//       }
//     })
//     .filter((child): child is Darkdouille.NodeDataChild => child !== undefined)
//     return {
//       node,
//       action,
//       type,
//       transformers,
//       children
//   }
// }

// function parseDarkdouilleTransformers (transformersNodes: NodeListOf<Element>): Darkdouille.TransformerDescriptor[] {
//   return [...transformersNodes].map(transformerNode => {
//     const children = [...transformerNode.childNodes]
//     const [name, ..._args] = children.map(child => child.textContent)
//     const args = _args.map(arg => arg ?? '')
//     return {
//       name: name ?? '',
//       arguments: args
//     }
//   })
// }

// function resolvePathInMergedDarkdouilleData (
//   path: (string | number)[],
//   mergedDarkdouilleData: ReturnType<typeof mergeDarkdouilleData>
// ): Darkdouille.MergedNodeData | undefined
// function resolvePathInMergedDarkdouilleData (
//   path: (string | number)[],
//   mergedDarkdouilleData: ReturnType<typeof mergeDarkdouilleData>,
//   createIfMissing: false
// ): Darkdouille.MergedNodeData | undefined
// function resolvePathInMergedDarkdouilleData (
//   path: (string | number)[],
//   mergedDarkdouilleData: ReturnType<typeof mergeDarkdouilleData>,
//   createIfMissing: true
// ): Darkdouille.MergedNodeData
// function resolvePathInMergedDarkdouilleData (
//   path: (string | number)[],
//   mergedDarkdouilleData: ReturnType<typeof mergeDarkdouilleData>,
//   createIfMissing: boolean = false
// ): Darkdouille.MergedNodeData | undefined {
//     if (createIfMissing) {
//     const created: Darkdouille.MergedNodeData = path.reduce((
//       currentPathStep: Darkdouille.MergedNodeData,
//       pathChunk) => {
//       if (currentPathStep.node.nodeType === Node.TEXT_NODE) {
        
//       }// return undefined
//       // if (currentPathStep.nodeType === Darkdouille.NodeType.TEXT) return undefined
//       // const nextPathStep = currentPathStep.children.get(pathChunk)
//       // return nextPathStep

//       return currentPathStep
//     }, mergedDarkdouilleData)
//     return created  
//   }

//   const resolved: Darkdouille.MergedNodeData | undefined = path.reduce((
//     currentPathStep: Darkdouille.MergedNodeData | undefined,
//     pathChunk) => {
//     if (currentPathStep === undefined) return undefined
//     if (currentPathStep.node.nodeType === Node.TEXT_NODE) return undefined
//     const nextPathStep = currentPathStep.children.get(pathChunk)
//     return nextPathStep
//   }, mergedDarkdouilleData)
//   return resolved
// }

const darkdouilles = document.body.querySelectorAll('data.lm-page-config') as NodeListOf<HTMLDataElement>
const merged = mergeDarkdouilles([...darkdouilles])
console.log(merged.innerHTML)
// console.log(merged.innerHTML)
// const parsedList = [...darkdouilles].map(darkdouille => {
//   return parseDarkdouille(darkdouille)
// }).filter((e): e is DarkdouilleNodeData => e !== undefined)
// const merged = parsedList.reduce((
//   mergedAcc: MergedDarkdouilleNodeData | null,
//   parsed: DarkdouilleNodeData) => {
//   return mergeDarkdouilleData(
//     parsed,
//     [],
//     mergedAcc ?? undefined
//   )
// }, null)

function mergeDarkdouilles (darkdouilles: HTMLDataElement[]) {
  const pathsMap = new Map<string, HTMLDataElement>()
  const rootElement = document.createElement('data')
  rootElement.append(...darkdouilles)
  representElement(rootElement, [], pathsMap)
  console.log(pathsMap)
  return rootElement
}

let prevWasTheOne = false
function representElement (
  element: HTMLDataElement,
  path: Array<string | number>,
  pathsMap: Map<string, HTMLDataElement>
) {
  const children = [...element.childNodes]
  let unnamedChildrenCnt = 0
  const elementTransformers: HTMLDataElement[] = []
  children.forEach(childNode => {
    const isDataElement = childNode instanceof HTMLDataElement
    if (!isDataElement) return;
    const childDataElement = childNode
    // Type
    const typeAttr = childDataElement.getAttribute('type')
    if (typeAttr === Darkdouille.Type.TRANSFORMER) {
      elementTransformers.push(childDataElement)
      childDataElement.remove()
      console.groupEnd()
      return
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
    if (elementAtThisPath === undefined) {
      pathsMap.set(thisNodeStrFullPath, childDataElement)
    } else {
      if (type !== null) {
        elementAtThisPath.setAttribute('type', type)
      }
      const grandChildrenNodes = [...childDataElement.childNodes]
      grandChildrenNodes.forEach(nd => nd.remove())
      if (action === Darkdouille.Action.APPEND) {
        elementAtThisPath.append(...grandChildrenNodes)
      } else if (action === Darkdouille.Action.PREPEND) {
        elementAtThisPath.prepend(...grandChildrenNodes)
      }
      else {
        elementAtThisPath.replaceChildren(...grandChildrenNodes)
        // elementAtThisPath.append(...grandChildrenNodes)
      }
    }
    representElement(elementAtThisPath ?? childDataElement, thisNodeFullPath, pathsMap)
  })
  element.append(...elementTransformers)
}




// function mergeDarkdouilleData (
//   nodeData: Darkdouille.NodeData,
//   path: (string | number)[] = [],
//   toReturn: Darkdouille.MergedNodeData = {
//     node: nodeData.node,
//     type: null,
//     transformers: [],
//     children: new Map<string | number, Darkdouille.MergedNodeData>()
//   }): Darkdouille.MergedNodeData {
//   const {
//     node,
//     action,
//     type,
//     transformers,
//     children
//   } = nodeData
//   let resolved = resolvePathInMergedDarkdouilleData(path, toReturn)
//   if (action === Darkdouille.Action.APPEND) {
    

//   } else if (action === Darkdouille.Action.PREPEND) {

//   } else {
    
//   }
  
  
//   //   const lol: Array<
//   //   [null, Darkdouille.TextNodeData]
//   //   | [string, Darkdouille.ElementNodeData]
//   //   | [number, Darkdouille.ElementNodeData]
//   // > = nodeData.children.map(childItem => {
//   //     if (childItem.type === 'text') return [null, childItem.data]
//   //     else if (childItem.type === 'named') return [childItem.key, childItem.data]
//   //     return [childItem.key, childItem.data]
//   // })
  
  
//   // const lol: Darkdouille.MergedElementNodeDataChildrenAsArr | undefined = nodeData.children.map(childItem => {
//   //   if (childItem.type === 'text') return [null, childItem.data]
//   //   else if (childItem.type === 'named') return [childItem.key, childItem.data]
//   //   else if (childItem.type === 'unnamed') return [childItem.key, childItem.data]
//   //   return undefined
//   // })
  

  
  
//   return toReturn
// }
