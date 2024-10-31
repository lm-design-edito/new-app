import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { isInEnum } from '@design-edito/tools/agnostic/objects/enums/is-in-enum'
import { Defaults } from '../defaults'
import { Types } from '../types'

export namespace Merge {

  export const defaultOptions: Types.Merge.Options = {
    actionAttribute: Defaults.actionAttribute,
    keyAttribute: Defaults.keyAttribute
  }

  export function fillOptions (partial: Partial<Types.Merge.Options>): Types.Merge.Options {
    return {
      ...defaultOptions,
      ...partial
    }
  }
  
  export function mergeNodes (
    nodes: Array<Element | Text>,
    options: Partial<Types.Merge.Options> = defaultOptions): Element | Text {
    const [first, ...rest] = nodes
    const filledOptions = fillOptions(options)
    const actionAttribute  = filledOptions.actionAttribute
    const keyAttribute  = filledOptions.keyAttribute
    if (first === undefined) throw new Error('Expecting at least one node')
    const { Text, Element, document } = Window.get()
  
    /* Local utils function */
    const isTextOrElement = (node: Node): node is Text | Element => node instanceof Text || node instanceof Element
  
    /* Shallow merge nodes */
    let CURRENT: Element | Text = first
    rest.forEach(node => {
      if (node instanceof Text) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      const actionRaw = node.getAttribute(actionAttribute)
      const action = isInEnum(Types.Merge.Action, actionRaw as any)
        ? actionRaw as Types.Merge.Action
        : Types.Merge.Action.REPLACE
      if (action === Types.Merge.Action.REPLACE) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      if (CURRENT instanceof Text) {
        if (node instanceof Text) {
          const appended = action === Types.Merge.Action.APPEND
            ? document.createTextNode(`${CURRENT.textContent}${node.textContent}`)
            : document.createTextNode(`${node.textContent}${CURRENT.textContent}`)
          CURRENT.remove()
          node.remove()
          CURRENT = appended
          return;
        }
        CURRENT.remove()
        CURRENT = node
        return;
      }
      if (node instanceof Text) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      const currentAttributes = Array.from(CURRENT.attributes)
      const nodeAttributes = Array.from(node.attributes)
      const nodeChildren = Array.from(node.childNodes).filter(isTextOrElement)
      const outputAttributes = action === Types.Merge.Action.APPEND
        ? [...currentAttributes, ...nodeAttributes]
        : [...nodeAttributes, ...currentAttributes]
      if (action === Types.Merge.Action.APPEND) CURRENT.append(...nodeChildren)
      else CURRENT.prepend(...nodeChildren)
      outputAttributes.forEach(attr => (CURRENT as Element).setAttribute(attr.name, attr.value))
      node.remove()
      return;
    })
  
    /* List child nodes sharing the same subpath */
    const wrapperChildren = Array.from(CURRENT.childNodes).filter(isTextOrElement)
    const subpaths = new Map<string | number, Array<Element | Text>>()
    let positionnedChildrenCount = 0
    wrapperChildren.forEach(child => {
      if (child instanceof Text) {
        const childKey = positionnedChildrenCount
        const found = subpaths.get(childKey) ?? []
        found.push(child)
        subpaths.set(childKey, found)
        positionnedChildrenCount += 1
      } else {
        const rawChildKey = child.getAttribute(keyAttribute)
        const childKey = rawChildKey ?? positionnedChildrenCount
        const found = subpaths.get(childKey) ?? []
        found.push(child)
        subpaths.set(childKey, found)
        if (rawChildKey === null) { positionnedChildrenCount += 1 }
      }
    })
  
    /* For each node sharing a subpath, merge them */
    subpaths.forEach(nodes => {
      if (nodes.length < 2) return
      return mergeNodes(nodes, {
        actionAttribute,
        keyAttribute
      })
    })
  
    /* At the end of the process, find and return wrapper's first child */
    return CURRENT
  }

  export function mergeRoots (...args: Parameters<typeof mergeNodes>): Element | Text {
    const [nodes, options] = args
    const filledOptions = fillOptions(options ?? {})
    const actionAttribute = filledOptions.actionAttribute
    const { Element } = Window.get()
    const elements = nodes.filter(e => e instanceof Element)
    elements.forEach(element => {
      const elementAction = element.getAttribute(actionAttribute) ?? Types.Merge.Action.APPEND
      element.setAttribute(actionAttribute, elementAction)
    })
    const merged = mergeNodes(elements, options)
    return merged
  }
}
