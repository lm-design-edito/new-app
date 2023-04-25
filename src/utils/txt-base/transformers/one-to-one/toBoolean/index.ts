import { makeTransformer } from '../..'
import isFalsy from '~/utils/is-falsy'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toBoolean',
  TransformerType.ONE_TO_ONE,
  value => {
    if (typeof value === 'string'
      && value.trim().match(/^false$/i)) {
      return false
    }
    return !isFalsy(value)
  }
)
