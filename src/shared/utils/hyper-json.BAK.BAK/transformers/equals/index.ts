import { Types } from '../../types'
import { Utils } from '../../utils'

export const equals: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    return {
      action: 'REPLACE',
      value: args.every(arg => arg === currentValue)
    }
  })
}
