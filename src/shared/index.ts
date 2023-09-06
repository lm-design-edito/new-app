namespace Darkdouille {
  export enum NodeType { ELEMENT, TEXT }
  export enum Action {
    APPEND = 'append',
    PREPEND = 'prepend',
    OVERWRITE = 'overwrite'
  }
  export const Actions = Object.values(Darkdouille.Action)
  export enum Type {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    HTML = 'html',
    LMHTML = 'lm-html',
    REF = 'ref',
    ARRAY = 'list',
    RECORD = 'record'
  }
  export const Types = Object.values(Darkdouille.Type)
}

const darkdouille = document.body.querySelector('.lm-page-config')
if (darkdouille !== null) parseDarkdouille(darkdouille)

function parseDarkdouille (element: Element) {
  const result = parseDarkdouilleNode(element)
  console.log('result', result)
}

type TransformerDescriptor = {
  name: string
  arguments: string[]
}

type DarkdouilleNodeData = {
  node: Node
  nodeType: Darkdouille.NodeType
  action: Darkdouille.Action | null
  type: Darkdouille.Type | null
  transformers: TransformerDescriptor[]
  textChildren: Array<{
    data: DarkdouilleNodeData
  }>
  namedChildren: Array<{
    name: string,
    data: DarkdouilleNodeData
  }>
  unnamedChildren: Array<{
    position: number,
    data: DarkdouilleNodeData
  }>
}

function parseDarkdouilleNode (node: Node): DarkdouilleNodeData | undefined {
  const { nodeType: _nodeType } = node
  
  // Text node
  if (_nodeType === Node.TEXT_NODE) return {
    node,
    nodeType: Darkdouille.NodeType.TEXT,
    action: null,
    type: null,
    transformers: [],
    textChildren: [],
    namedChildren: [],
    unnamedChildren: []
  }
  
  // Anything but Element node
  if (_nodeType !== Node.ELEMENT_NODE) return undefined
  
  // Element node
  const element = node as Element
  const _action = element.getAttribute('action')
  const action = Darkdouille.Actions.includes(_action as any) ? _action as Darkdouille.Action : null
  const _type = element.getAttribute('type')
  const type = Darkdouille.Types.includes(_type as any) ? _type as Darkdouille.Type : null
  const transformersNodes = element.querySelectorAll('[type="transformer"]')
  const transformers = parseDarkdouilleTransformers(transformersNodes)
  const children = [...element.childNodes]
    .filter(child => ![...transformersNodes].includes(child as Element))
  const textChildren: DarkdouilleNodeData['textChildren'] = []
  const namedChildren: DarkdouilleNodeData['namedChildren'] = []
  const unnamedChildren: DarkdouilleNodeData['unnamedChildren'] = []
  children.forEach(child => {
    const childData = parseDarkdouilleNode(child)
    if (childData === undefined) return;
    if (childData.nodeType === Darkdouille.NodeType.TEXT) {
      textChildren.push({ data: childData })
      return;
    }
    const { node } = childData
    if (!(node instanceof Element)) return;
    const name = node.getAttribute('class')
    if (name !== null) namedChildren.push({ name, data: childData })
    else unnamedChildren.push({ position: unnamedChildren.length, data: childData })
  })
  return {
    node,
    nodeType: Darkdouille.NodeType.ELEMENT,
    action,
    type,
    transformers,
    textChildren,
    namedChildren,
    unnamedChildren
  }
}

function parseDarkdouilleTransformers (transformersNodes: NodeListOf<Element>): TransformerDescriptor[] {
  return [...transformersNodes].map(transformerNode => {
    const children = [...transformerNode.childNodes]
    const [name, ..._args] = children.map(child => child.textContent)
    const args = _args.map(arg => arg ?? '')
    return {
      name: name ?? '',
      arguments: args
    }
  })
}
