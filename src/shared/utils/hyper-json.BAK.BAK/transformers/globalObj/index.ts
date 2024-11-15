import { Types } from '../../types'
import { Utils } from '../../utils'

export const globalObj: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (_, callerTree) => {
    return {
      action: 'REPLACE',
      value: callerTree.globalObj
    }
  })
}
