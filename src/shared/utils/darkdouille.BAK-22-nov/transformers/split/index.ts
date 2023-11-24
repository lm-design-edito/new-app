import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toString from '../toString'

const split: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    if (typeof inputValue !== 'string') return inputValue
    return resolvedArgs.reduce<string[]>((splitted, splitter) => {
      const strSplitter = toString()(splitter)
      return splitted
        .map(chunk => chunk.split(strSplitter))
        .flat()
    }, [inputValue])
  }
}

export default split
