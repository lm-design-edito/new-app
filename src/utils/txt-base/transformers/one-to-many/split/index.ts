import { argsStrToArgsArr, makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'split',
  TransformerType.ONE_TO_MANY,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    if (typeof value === 'string') {
      const splitter = argsArr[0] ?? ''
      return value.split(splitter)
    }
    return [value]
  }
)
