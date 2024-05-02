import { isNotNullish } from '~/utils/is-nullish'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import clone from '../clone'
import toHtml from '../toHtml'
import toString from '../toString'
import isInEnum from '~/utils/is-in-enum'

enum Action {
  ADD = 'add',
  REMOVE = 'remove',
  TOGGLE = 'toggle'
}

const attributes: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [rawAction, rawAttrName, rawAttrValue] = resolvedArgs
    const action = isNotNullish(rawAction) ? toString()(rawAction) : undefined
    const nodeListInput = clone<NodeListOf<Node>>()(toHtml()(inputValue))
    if (action === undefined || !isInEnum(Action, action)) return nodeListInput
    const attrName = isNotNullish(rawAttrName) ? toString()(rawAttrName) : undefined
    const attrValue = isNotNullish(rawAttrValue) ? toString()(rawAttrValue) : undefined
    const wrapperDiv = document.createElement('div')
    wrapperDiv.append(...nodeListInput)
    const targets = wrapperDiv.childNodes
    const targetsArr = Array.from(targets)
    targetsArr.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return node
      const element = node as Element
      if (action === Action.ADD) {
        if (attrName === undefined) return element
        return element.setAttribute(attrName, attrValue ?? '')
      }
      else if (action === Action.REMOVE) {
        if (attrName === undefined) {
          Array.from(element.attributes).forEach(attr => element.removeAttribute(attr.name))
          return element
        }
        if (attrValue !== undefined) {
          const currAttribute = element.getAttribute(attrName)
          if (currAttribute === attrValue) element.removeAttribute(attrName)
          return element
        }
        element.removeAttribute(attrName)
        return element
      }
      else if (action === Action.TOGGLE) {
        if (attrName === undefined) return element
        if (attrValue !== undefined) {
          const currAttribute = element.getAttribute(attrName)
          if (currAttribute !== attrValue) return element
          if (currAttribute === null) {
            element.setAttribute(attrName, attrValue)
            return element
          }
          element.removeAttribute(attrName)
          return element
        } else {
          element.toggleAttribute(attrName)
          return element
        }
      }
    })
    const fragment = document.createDocumentFragment()
    fragment.append(...wrapperDiv.childNodes)
    return fragment.childNodes
  }
}

export default attributes
