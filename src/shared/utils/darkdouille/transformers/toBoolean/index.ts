import isFalsy from '~/utils/is-falsy'
import { Darkdouille } from '../..'

const toBoolean: Darkdouille.TransformerFunctionGenerator<boolean> = () => {
  return (inputValue): boolean => {
    if (inputValue === '0') return false
    return isFalsy(inputValue)
  }
}

export default toBoolean
