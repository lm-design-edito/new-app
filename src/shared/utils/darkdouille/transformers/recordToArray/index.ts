import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'

const recordToArray: Darkdouille.TransformerFunctionGenerator = () => {
  return inputValue => {
    if (!isRecord(inputValue)) return inputValue
    return Object.values(inputValue)
  }
}

export default recordToArray
