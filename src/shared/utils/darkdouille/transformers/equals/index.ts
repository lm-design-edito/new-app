import { Darkdouille } from '../..'

const equals: Darkdouille.TransformerFunctionGenerator<boolean> = (...args) => {
  return (inputValue): boolean => args.every(arg => arg === inputValue)
}

export default equals
