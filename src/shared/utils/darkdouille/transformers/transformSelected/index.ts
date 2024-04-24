import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toNodeList from '../_utils/toNodeList'
import insertNode from '~/utils/insert-node'
import toHtml from '../toHtml'
import toString from '../toString'
import clone from '../clone'

const transformSelected: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = (...args) => {
  const [rawSelectorOrTransformer, ...rawLeftTransformers] = args
  return (inputValue): NodeListOf<Node> => {
    const htmlInput = toHtml()(inputValue)
    const firstArgIsSelector = typeof rawSelectorOrTransformer !== 'function'
    const strSelector = firstArgIsSelector ? toString()(rawSelectorOrTransformer) : undefined
    const rawTransformers = firstArgIsSelector ? [...rawLeftTransformers] : [rawSelectorOrTransformer, ...rawLeftTransformers]
    const fragment = document.createDocumentFragment()
    fragment.append(...htmlInput)
    const targets = strSelector === undefined ? [...fragment.children] : [...fragment.querySelectorAll(strSelector)]
    targets.forEach(target => {
      const clonedTarget = target.cloneNode(true) as Element
      const toTransform = clone<NodeListOf<Node>>()(toNodeList(clonedTarget))
      const rawTransformed = rawTransformers.reduce<Darkdouille.TreeValue>((reduced, rawTransformer) => {
        const resolvedTransformer = resolveArgs(reduced, rawTransformer)[0]
        return resolvedTransformer
      }, toTransform)
      const htmlTransformed = toHtml()(rawTransformed)
      Array
        .from(htmlTransformed)
        .reverse()
        .forEach(node => insertNode(node, 'after', target))
      target.remove()
    })
    return fragment.childNodes
  }
}

export default transformSelected
