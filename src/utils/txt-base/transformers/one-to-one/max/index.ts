import { argsStrToArgsArr, makeTransformer } from '../..'
import { toNumber } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'max',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    return Math.max(toNumber(value), toNumber(argsArr[0]))
  }
)
