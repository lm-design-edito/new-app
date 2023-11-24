import { Darkdouille } from '../..'

function that<T extends Darkdouille.TreeValue> ()  {
  return (inputValue: T) => inputValue
}

export default that
