import { Utils } from '../../utils'
import { Types } from '../../types'

export const toNull: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => ({
    action: 'REPLACE',
    value: null
  }))
}
