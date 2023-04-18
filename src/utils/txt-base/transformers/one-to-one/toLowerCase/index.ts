import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toLowerCase',
  TransformerType.ONE_TO_ONE,
  value => {
    if (typeof value === 'string') return value.toLowerCase()
    return value
  }
)
