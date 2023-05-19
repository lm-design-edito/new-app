import { argsStrToArgsArr, makeTransformer } from '../..'
import { toString } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'prepend',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    return `${toString(argsArr[0])}${toString(value)}`
  }
)
