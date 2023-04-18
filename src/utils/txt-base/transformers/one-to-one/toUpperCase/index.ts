import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toUpperCase',
  TransformerType.ONE_TO_ONE,
  value => {
    if (typeof value === 'string') return value.toUpperCase()
    return value
  }
)
