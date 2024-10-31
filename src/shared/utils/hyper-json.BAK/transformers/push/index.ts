import { Types } from '../../types'
import { Utils } from '../../utils'

export const push: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    if (!Array.isArray(currentValue)) return Utils.makeTransformerError({
      message: 'Current value must be an array',
      input: currentValue
    })
    const outputValue = [...currentValue, ...args]
    return {
      action: 'REPLACE',
      value: outputValue
    }
  })
}
