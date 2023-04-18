import { argsStrToArgsArr, makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'join',
  TransformerType.MANY_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    const joiner = argsArr[0] ?? ','
    // [WIP] maybe convert the values to string via transformer before ?
    return value.join(joiner)
  }
)
