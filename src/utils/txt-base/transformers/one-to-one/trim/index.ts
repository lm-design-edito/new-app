import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'trim',
  TransformerType.ONE_TO_ONE,
  value => {
    if (typeof value === 'string') return value.trim()
    return value
  }
)
