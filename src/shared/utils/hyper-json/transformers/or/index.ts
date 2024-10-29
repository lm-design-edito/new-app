import { isNotFalsy } from '@design-edito/tools/agnostic/booleans/is-falsy'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const or: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    return {
      action: 'REPLACE',
      value: [currentValue, ...args].some(isNotFalsy)
    }
  })
}
