import { makeTransformer } from '../..'
import { TransformerType } from '../../types'
import toString from '../toString'

export default makeTransformer(
  'toRef',
  TransformerType.ONE_TO_ONE,
  (value, _args, resolve) => {
    if (resolve === undefined) return value
    const strValue = toString.apply(value, '')
    if (typeof strValue === 'string') {
      const resolved = resolve(strValue)
      if (resolved !== undefined) return resolved
    }
    return value
  }
)
