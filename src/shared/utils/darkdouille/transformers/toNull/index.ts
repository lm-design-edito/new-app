import { Darkdouille } from '../..'

const toNull: Darkdouille.TransformerGenerator<null> = () => {
  return (): null => null
}

export default toNull
