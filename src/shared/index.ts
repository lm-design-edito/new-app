namespace Darkdouille {
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
    LMHTML = 'lmhtml',
    REF = 'ref',
    DATA = 'data',
    TRANSFORMER = 'transformer'
  }
  
  export const Types = Object.values(Type)
  
  export function isType (tag: string): tag is Type {
    return Types.includes(tag as any)
  }
  
  export function getTypeFromElement (element: Element) {
    const typeTag = element.tagName.toLowerCase()
    if (!isType(typeTag)) return null
    const typeAttr = element.getAttribute('type')
    let type: Exclude<Type, Type.DATA> | null
    if (typeAttr !== null && isType(typeAttr) && typeAttr !== Type.DATA) { type = typeAttr }
    else if (isType(typeTag) && typeTag !== Type.DATA) { type = typeTag }
    else { type = null }
    return type
  }
  
  export function isElement (node: Node): node is Element {
    const isElement = node instanceof Element
    if (!isElement) return false
    const typeTag = node.tagName.toLowerCase()
    return isType(typeTag)
  }
  
  export function merge (...darkdouilles: HTMLDataElement[]) {
    const rootElement = document.createElement('data')
    darkdouilles.forEach(darkdouille => {
      darkdouille.remove()
      const darkdouilleNodes = [...darkdouille.childNodes]
      rootElement.append(...darkdouilleNodes)
    })
    reduceElement(rootElement)
    console.log(rootElement.outerHTML)
  }

  export function reduceElement (element: Element): Element {
    let unnamedChildrenCnt = 0
    const childNodes = [...element.childNodes]
    const propertiesPathsMap = new Map<string, Element>()
    childNodes.forEach(childNode => {
      const isTextOrElementNode = [Node.TEXT_NODE, Node.ELEMENT_NODE].includes(childNode.nodeType as any)
      if (!isTextOrElementNode) return childNode.parentNode?.removeChild(childNode)
      const isDarkdouilleElement = Darkdouille.isElement(childNode)
      if (!isDarkdouilleElement) return;
      const type = Darkdouille.getTypeFromElement(childNode)
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
      const isDarkdouilleElement = Darkdouille.isElement(childNode)
      if (!isDarkdouilleElement) return;
      const type = Darkdouille.getTypeFromElement(childNode)
      if (type === Darkdouille.Type.TRANSFORMER) return;
      reduceElement(childNode)
    })
    return element
  }
}

const darkdouilles = document.body.querySelectorAll('data.lm-page-config') as NodeListOf<HTMLDataElement>
const merged = Darkdouille.merge(...darkdouilles)

