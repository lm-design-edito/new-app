import { argsStrToArgsArr, makeTransformer } from '../..'
import { toString } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'append',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    return `${toString(value)}${toString(argsArr[0])}`
  }
)
