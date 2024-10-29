import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const split: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const { Text } = Window.get()
    const [splitter] = args
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)) return Utils.makeTransformerError({
      message: 'Current value must be string or Text',
      input: currentValue
    })
    if (typeof splitter !== 'string') return Utils.makeTransformerError({
      message: 'Splitter argument must be string',
      input: splitter !== undefined ? splitter : '<undefined>'
    })
    const strCurrentValue = Cast.toString(currentValue)
    const splitted = strCurrentValue
      .split(splitter)
      .map(e => typeof currentValue === 'string' ? Cast.toString(e) : Cast.toText(e))
    return {
      action: 'REPLACE',
      value: splitted
    }
  })
}
