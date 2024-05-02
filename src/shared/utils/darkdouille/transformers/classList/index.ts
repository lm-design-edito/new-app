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

const classList: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = (...args) => {
  return inputValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [rawAction, rawClasses] = resolvedArgs
    const action = isNotNullish(rawAction) ? toString()(rawAction) : undefined
    const nodeListInput = clone<NodeListOf<Node>>()(toHtml()(inputValue))
    if (action === undefined || !isInEnum(Action, action)) return nodeListInput
    const classes = isNotNullish(rawClasses) ? toString()(rawClasses).trim().split(/\s+/igm) : []
    const wrapperDiv = document.createElement('div')
    wrapperDiv.append(...nodeListInput)
    const targets = wrapperDiv.childNodes
    const targetsArr = Array.from(targets)
    targetsArr.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return node
      const element = node as Element
      if (classes.length === 0) {
        if (action === Action.REMOVE) {
          element.classList.remove(...element.classList)
          return element
        }
        return element
      }
      if (action === Action.ADD) element.classList.add(...classes)
      else if (action === Action.REMOVE) element.removeAttribute('class')
      else if (action === Action.TOGGLE) classes.forEach(clss => element.classList.toggle(clss))
      return element
    })
    const fragment = document.createDocumentFragment()
    fragment.append(...wrapperDiv.childNodes)
    return fragment.childNodes
  }
}

export default classList
