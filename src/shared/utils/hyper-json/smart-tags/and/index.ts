import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isNotFalsy } from '@design-edito/tools/agnostic/booleans/is-falsy'
import { Utils } from '../../utils'
import { Types } from '../../types'

type Input = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = boolean

export const and = Utils.SmartTags.makeData<Input, Args, Output>('and', {
  outputCheck: o => Utils.typeCheck(o, 'boolean')
}, (input, args) => {
  return [input, ...args].every(isNotFalsy)
    ? Outcome.makeSuccess(true)
    : Outcome.makeFailure(false)
})
