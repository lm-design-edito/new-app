import { Darkdouille } from '../..'

const toRef: Darkdouille.TransformerFunctionGenerator = (...args) => {
  return (inputValue) => {
    return inputValue
  }
}

export default toRef
