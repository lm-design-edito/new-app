import { Darkdouille } from '../..'

const pickRandom: Darkdouille.TransformerFunctionGenerator = () => {
  return inputValue => {
    if (!Array.isArray(inputValue)) return inputValue
    const pickedPos = Math.floor(Math.random() * inputValue.length)
    return inputValue[pickedPos]
  }
}

export default pickRandom
