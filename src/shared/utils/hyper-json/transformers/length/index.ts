import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const length: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const { Element, NodeList, Text } = Window.get()
    if (typeof currentValue === 'string'
      || Array.isArray(currentValue)
      || currentValue instanceof NodeList) return {
      action: 'REPLACE',
      value: currentValue.length
    }
    if (currentValue instanceof Element) return {
      action: 'REPLACE',
      value: Array.from(currentValue.childNodes).length
    }
    if (currentValue instanceof Text) return {
      action: 'REPLACE',
      value: currentValue.data.length
    }
    return Utils.makeTransformerError(`Current value must be of type string, Array, NodeList, Element or Text`)
  })
}
