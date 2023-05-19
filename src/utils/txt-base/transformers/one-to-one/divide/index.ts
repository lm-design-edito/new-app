import { argsStrToArgsArr, makeTransformer } from '../..'
import { toNumber } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'divide',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    return toNumber(value) / toNumber(argsArr[0])
  }
)
