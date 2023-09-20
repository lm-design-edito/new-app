import { argsStrToArgsArr, makeTransformer } from '../..'
import replaceAll from '~/utils/replace-all'
import { toString } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'replace',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    const argsArr = argsStrToArgsArr(argsStr)
    const [searcher = '', ...replacers] = argsArr as Array<string|undefined>
    const replacer = replacers.join(' ')
    const strValue = toString(value)
    if (searcher.match(/^\//)
      && searcher.match(/\/$/)) return replaceAll(strValue, new RegExp(searcher), replacer)
    else return replaceAll(strValue, searcher, replacer)
  }
)
