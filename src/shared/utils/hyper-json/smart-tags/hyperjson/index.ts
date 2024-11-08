import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Cast } from '../../cast'
import { Types } from '../../types'

type Input = Types.Tree.RecordValue
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.RecordValue

export const hyperjson = Utils.SmartTags.makeData<Input, Args, Output>('hyperjson', {
  initializer: () => ({}),
  wrapper: Cast.toRecord,
  inputCheck: i => Utils.typeCheck(i, 'record'),
  outputCheck: i => Utils.typeCheck(i, 'record')
}, i => Outcome.makeSuccess(i))
