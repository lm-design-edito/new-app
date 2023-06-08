import { toString } from '~/utils/cast'
import clamp from '~/utils/clamp'
import { Base, Collection, Entry, Field } from '~/utils/txt-base'
import { argsStrToArgsArr, makeTransformer } from '../..'
import { TransformerType } from '../../types'

export default makeTransformer(
  'toString',
  TransformerType.ONE_TO_ONE,
  (value, argsStr) => {
    if (typeof value === 'number') {
      const argsArr = argsStrToArgsArr(argsStr)
      const nanBase = parseInt(argsArr[0] ?? 10)
      const anyBase = Number.isNaN(nanBase) ? 10 : nanBase
      const base = clamp(anyBase, 2, 36)
      return value.toString(base)
    }
    if (value instanceof HTMLElement) return value.outerHTML.toString()
    if (value instanceof Base
      || value instanceof Collection
      || value instanceof Entry
      || value instanceof Field) return toString(value.value)
    return value?.toString() ?? 'null'
  }
)
