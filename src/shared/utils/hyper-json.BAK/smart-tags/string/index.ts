import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.StringValue

export const string = Utils.SmartTags.makeData<Input, Args, Output>('string', {
  initializer: () => '',
  outputCheck: o => Utils.typeCheck(o, 'string')
}, (input, args) => {
  const stringified = [input, ...args].map(Cast.toString).join()
  return Outcome.makeSuccess(stringified)
})
