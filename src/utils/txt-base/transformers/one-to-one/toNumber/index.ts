import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toNumber',
  TransformerType.ONE_TO_ONE,
  value => {
    if (typeof value === 'number') return value
    if (value === true) return 1
    if (value === false) return 0
    if (value === null) return 0
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      if (!Number.isNaN(parsed)) return parsed
    }
    return value
  }
)
