import { Darkdouille } from '../..'

const toNull: Darkdouille.TransformerFunctionGenerator<null> = () => {
  return (): null => null
}

export default toNull
