import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toHtml from '../toHtml'
import toString from '../toString'
import clone from '../clone'

const querySelector: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = (...args) => {
  return (inputValue): NodeListOf<Node> => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [resolvedSelector] = resolvedArgs
    const htmlInput = clone<NodeListOf<Node>>()(toHtml()(inputValue))
    if (resolvedSelector === undefined) return htmlInput
    const strSelector = toString()(resolvedSelector)
    const wrapperDiv = document.createElement('div')
    wrapperDiv.append(...htmlInput)
    const selected = wrapperDiv.querySelectorAll(strSelector)
    const frag = document.createDocumentFragment()
    frag.append(...selected)
    return frag.childNodes
  }
}

export default querySelector
