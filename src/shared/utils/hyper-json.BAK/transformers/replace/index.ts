import { replaceAll } from '@design-edito/tools/agnostic/strings/replace-all'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const replace: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const { Text, NodeList, Element } = Window.get()
    const makeError = Utils.makeTransformerError
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)
      && !(currentValue instanceof Element)
      && !(currentValue instanceof NodeList)) return makeError('Current value must be string, Text, Element or NodeList')
    if (args.some(arg => typeof arg !== 'string'
      && !(arg instanceof Text)
      && !(arg instanceof Element)
      && !(arg instanceof NodeList))) return makeError('Arguments must be of type string, Text, Element or NodeList')
    const [first, second] = args as Array<string | Text | Element | NodeListOf<Element | Text>>
    if (first === undefined || second === undefined) return makeError(`Expecting at least 2 arguments. Found only ${args.length}`)
    const replacer = args.at(-1) as string | Text | Element | NodeListOf<Element | Text>
    const strReplacer = Cast.toString(replacer)
    const toReplace = args.slice(0, -1)
    const strToReplace = toReplace.map(Cast.toString)
    const strInput = Cast.toString(currentValue)
    const strOutput = strToReplace.reduce((str, torpl) => replaceAll(str, torpl, strReplacer), strInput)
    if (typeof currentValue === 'string') return { action: 'REPLACE', value: strOutput }
    if (currentValue instanceof Text) return { action: 'REPLACE', value: Cast.toText(strOutput) }
    if (currentValue instanceof Element) {
      const returnedElement = Cast.toElement(strOutput).firstElementChild
      if (returnedElement === null) return makeError('Something went wrong while converting the output to an Element')
      return {
        action: 'REPLACE',
        value: returnedElement
      }
    }
    // currentValue is assumed to be NodeList here
    return {
      action: 'REPLACE',
      value: Cast.toNodeList(strOutput)
    }
  })
}
