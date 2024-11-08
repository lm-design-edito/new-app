import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isNotFalsy } from '@design-edito/tools/agnostic/booleans/is-falsy'
import { Utils } from '../../utils'
import { SmartTags } from '..'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.StringValue

export const string = Utils.SmartTags.makeData<Input, Args, Output>('string', {
  initializer: () => '',
  wrapper: Cast.toString,
  outputCheck: o => Utils.typeCheck(o, 'string')
}, (input, args) => {
  const stringified = [input, ...args].map(Cast.toString).join()
  return Outcome.makeSuccess(stringified)
})
