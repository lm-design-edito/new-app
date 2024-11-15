import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = boolean

export const and = Utils.SmartTags.makeData<Input, Args, Output>('and', {
  argsCheck: a => Utils.typeCheck(a, 'array'),
  outputCheck: o => Utils.typeCheck(o, 'boolean')
}, (input, args) => {
  return [input, ...args].every(item => Cast.toBoolean(item) === true)
    ? Outcome.makeSuccess(true)
    : Outcome.makeFailure(false)
})
