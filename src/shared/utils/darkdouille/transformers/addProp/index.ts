import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'

const addProp: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return inputValue => {
    if (!isRecord(inputValue)) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [propName, propValue] = resolvedArgs
    if (typeof propName !== 'string') return inputValue
    return {
      ...inputValue,
      [propName]: propValue
    }
  }
}

export default addProp
