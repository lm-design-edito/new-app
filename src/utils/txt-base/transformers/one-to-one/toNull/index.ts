import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toNull',
  TransformerType.ONE_TO_ONE,
  () => null
)
