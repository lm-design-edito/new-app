import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const join: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const joiner = Cast.toString(args.at(0) ?? ',')
    if (!Array.isArray(currentValue)) return Utils.makeTransformerError({
      message: `Current value must be an array`,
      input: currentValue
    })
    return {
      action: 'REPLACE',
      value: currentValue.join(joiner)
    }
  })
}
