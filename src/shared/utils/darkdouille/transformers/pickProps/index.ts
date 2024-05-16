import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toString from '../toString'

const pickProps: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    if (!isRecord(inputValue)) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const targetProps = resolvedArgs.map(arg => toString()(arg))
    const returned: Darkdouille.TreeRecordValue = {}
    targetProps.forEach(targetProp => {
      if (!(targetProp in inputValue)) return;
      returned[targetProp] = inputValue[targetProp]
    })
    return returned
  }
}

export default pickProps
