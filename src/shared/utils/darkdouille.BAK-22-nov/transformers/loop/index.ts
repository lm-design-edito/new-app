import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'
import toNumber from '../toNumber'

const loop: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    let outputValue: Darkdouille.TreeValue = inputValue
    const [_, ...rawArgs] = args
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [rawLoops] = resolvedArgs
    const nbrLoops = toNumber()(rawLoops)
    for (let loop = 0; loop < nbrLoops; loop ++) {
      for (const arg of rawArgs) {
        const resolvedArg = resolveArgs(outputValue, arg)[0]
        outputValue = resolvedArg
      }
    }
    return outputValue
  }
}

export default loop
