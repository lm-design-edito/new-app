import {
  makeTransformer,
  getTransformer
} from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'map',
  TransformerType.MANY_TO_MANY,
  (value, argsStr, resolver) => {
    const [transformerName, ...otherArgs] = argsStr.split(' ')
    const transformer = getTransformer(transformerName)
    if (transformer === undefined) return value
    if (transformer.type !== TransformerType.ONE_TO_ONE) return value
    return value.map((val, pos) => transformer.apply(
      val,
      otherArgs.join(' ').replace('%pos%', `${pos}`),
      resolver
    ))
  }
)
