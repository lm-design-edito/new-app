import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import toBoolean from '../toBoolean'

const negate: Darkdouille.TransformerFunctionGenerator<boolean> = () => {
  return inputValue => {
    const booleanInput = toBoolean()(inputValue)
    return !booleanInput
  }
}

export default negate
