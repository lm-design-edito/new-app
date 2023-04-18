import { makeTransformer } from '../..'
import isFalsy from '../../../../is-falsy'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toBoolean',
  TransformerType.ONE_TO_ONE,
  value => !isFalsy(value)
)
