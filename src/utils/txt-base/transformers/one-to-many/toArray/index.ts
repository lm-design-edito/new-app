import { argsStrToArgsArr, makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toArray',
  TransformerType.ONE_TO_MANY,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    const length = parseInt(argsArr[0])
    if (Number.isNaN(length)) return [value]
    if (!Number.isInteger(length)) return [value]
    if (length <= 0) return [value]
    return new Array(length).fill(null).map(() => value)
  }
)
