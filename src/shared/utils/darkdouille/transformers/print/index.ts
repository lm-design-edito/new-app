import { Darkdouille } from '../..'
import clone from '../clone'

const print: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = () => {
  return inputValue => {
    console.log(clone()(inputValue))
    return inputValue
  }
}

export default print
