import replaceAll from '~/utils/replace-all'
import { makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'push',
  TransformerType.MANY_TO_MANY,
  (value, argsStr) => {
    const length = value.length
    return [...value, replaceAll(
      argsStr,
      '%pos%',
      `${length}`
    )]
  }
)
