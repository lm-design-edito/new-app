import { Utils } from '../../utils'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const toNodeList: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => ({
    action: 'REPLACE',
    value: Cast.toNodeList(currentValue)
  }))
}
