import replaceAll from '~/utils/replace-all'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const replace: Darkdouille.TransformerFunctionGenerator<string | NodeListOf<Node>> = (...args) => {
  return (inputValue): string | NodeListOf<Node> => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [firstArg, ...lastArgs] = resolvedArgs
    const toReplaceArgs = [firstArg, ...lastArgs.slice(0, -1)]
    const replacerArg = lastArgs[lastArgs.length - 1]
    const toReplaceStrArgs = toReplaceArgs.filter((elt): elt is string => typeof elt === 'string')
    const replacer = replacerArg instanceof NodeList ? replacerArg : toString()(replacerArg)
    const strReplacer = toString()(replacer)
    const strInput = toString()(inputValue)
    const strOutput = toReplaceStrArgs.reduce((str, torpl) => replaceAll(str, torpl, strReplacer), strInput)
    if (replacer instanceof NodeList || inputValue instanceof NodeList) {
      const wrapperDiv = document.createElement('div')
      wrapperDiv.innerHTML = strOutput
      return wrapperDiv.childNodes
    }
    return strOutput
  }
}

export default replace
