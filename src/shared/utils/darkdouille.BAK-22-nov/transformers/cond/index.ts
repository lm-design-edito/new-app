import isFalsy from '~/utils/is-falsy'
import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'

const cond: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [success, ifSuccess, ifFailure] = resolvedArgs
    if (isFalsy(success)) return ifFailure
    return ifSuccess
  }
}

export default cond
