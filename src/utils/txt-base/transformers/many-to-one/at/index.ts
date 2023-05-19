import { argsStrToArgsArr, makeTransformer } from '../..'
import { toNumber } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'at',
  TransformerType.MANY_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    const position = toNumber(argsArr[0])
    return value[position] ?? null
  }
)
