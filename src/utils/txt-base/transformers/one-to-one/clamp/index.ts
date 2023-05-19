import { argsStrToArgsArr, makeTransformer } from '../..'
import { toNumber } from '~/utils/cast'
import { TransformerType } from '../../types'
import clamp from '~/utils/clamp'

export default makeTransformer(
  'clamp',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    return clamp(
      toNumber(value),
      toNumber(argsArr[0]),
      toNumber(argsArr[1])
    )
  }
)
