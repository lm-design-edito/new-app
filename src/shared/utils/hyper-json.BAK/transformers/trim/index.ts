import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const trim: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const { Text } = Window.get()
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)) return Utils.makeTransformerError({
      message: 'Current value must be of type string or Text',
      input: currentValue
    })
    const inputStr = Cast.toString(currentValue)
    const trimmed = inputStr.trim()
    return {
      action: 'REPLACE',
      value: currentValue instanceof Text
        ? Cast.toText(trimmed)
        : trimmed
    }
  })
}
