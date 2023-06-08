import { argsStrToArgsArr, makeTransformer } from '../..'
import replaceAll from '~/utils/replace-all'
import { toString } from '~/utils/cast'
import { TransformerType } from '../../types'

export default makeTransformer(
  'replaceWithRef',
  TransformerType.ONE_TO_ONE,
  (value, argsStr, resolve) => {
    if (resolve === undefined) return value
    const argsArr = argsStrToArgsArr(argsStr)
    const [searcher = '', replacer = ''] = argsArr as Array<string|undefined>
    const replacerObj = resolve(replacer)
    if (replacerObj === undefined) return value
    const replacerObjValue = replacerObj.value
    const replacerObjStrValue = toString(replacerObjValue)
    const strValue = toString(value)
    if (searcher.match(/^\//)
      && searcher.match(/\/$/)) return replaceAll(strValue, new RegExp(searcher), replacerObjStrValue)
    else return replaceAll(strValue, searcher, replacerObjStrValue)
  }
)
