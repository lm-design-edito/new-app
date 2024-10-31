import { replaceInElement } from '@design-edito/tools/agnostic/html/replace-in-element'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'
import { getNodeAncestors } from '@design-edito/tools/agnostic/html/get-node-ancestors'

export const transformSelected: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (currentValue, callerTree) => {
    console.log('TRANSFORM SELECTED !!!')
    console.log(currentValue)
    console.log(...args)
    const makeError = Utils.makeTransformerError
    const { NodeList, Element, Text } = Window.get()
    if (!(currentValue instanceof Element)
      && !(currentValue instanceof NodeList)) return makeError({
      message: 'Current value must be Element or NodeList',
      input: currentValue
    })
    const [selector, ...transformerDescriptors] = args
    if (typeof selector !== 'string'
      && !(selector instanceof Text)) return makeError({
      message: 'Selector argument must be string or text',
      input: selector !== undefined ? selector : '<undefined>'
    })
    if (transformerDescriptors.length === 0) return makeError('No transformer descriptor provided')
    const elementInput = Cast.toElement(currentValue)
    const strSelector = Cast.toString(selector)
    const selected = Array.from(elementInput.querySelectorAll(strSelector))
      .sort((a, b) => {
        const aParents = getNodeAncestors(a, true)
        const bParents = getNodeAncestors(b, true)
        if (aParents.includes(b)) return -1
        if (bParents.includes(a)) return 1
        return 0
      })
    if (selected.length === 0) return makeError('The selector did not match any child element')
    for (const toTransform of selected) {
      let transforming: Types.Value = toTransform
      for (const transformer of transformerDescriptors) {
        if (typeof transformer === 'function') {
          const transformed: Types.TransformerReturnType = transformer(transforming, callerTree)
          if (transformed.action === null) continue;
          if (transformed.action === 'ERROR') return makeError({
            message: 'A transformation returned an error',
            transforming: toTransform.cloneNode(true) as Element,
            latestTransformationApplied: Utils.clone(transforming),
            transformerError: transformed.value,
            transformerName: transformer.transformerName,
            transformerArgs: transformer.args,
            transformer
          });
          transforming = transformed.value
        }
      }
      let transformed: Element | Text | NodeListOf<Element | Node>
      if (transforming instanceof Element
        || transforming instanceof Text
        || transforming instanceof NodeList) { transformed = transforming }
      else { transformed = Cast.toText(transforming) }
      replaceInElement(elementInput, new Map([[toTransform, transformed]]))
    }
    return {
      action: 'REPLACE',
      value: currentValue instanceof Element
        ? elementInput.cloneNode(true) as Element
        : Utils.toNodeListOfElementOrText(elementInput.childNodes)
    }
  })
}
