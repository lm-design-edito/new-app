import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.Value
type Args = []
type Output = Types.Tree.NullValue

// [WIP] finish this
export const nullFunc = Utils.SmartTags.makeData<Input, Args, Output>('null', {
  initializer: () => null,
  wrapper: Cast.toNull,
  argsCheck: Utils.SmartTags.expectEmptyArgs,
  outputCheck: o => Utils.typeCheck(o, 'null')
}, () => {
  return Outcome.makeSuccess(null)
})
