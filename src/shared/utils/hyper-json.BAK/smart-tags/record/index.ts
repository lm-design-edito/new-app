import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'

type Input = Types.Tree.Value
type Args = Array<Types.Tree.Value>
type Output = Types.Tree.RecordValue

export const record = Utils.SmartTags.makeData<Input, Args, Output>('record', {
  initializer: () => ({}),
  inputCheck: i => Utils.typeCheck(i, ...Types.Tree.allTypesNames),
  argsCheck: a => Utils.typeCheckMany(a, ...Types.Tree.allTypesNames),
  outputCheck: o => Utils.typeCheck(o, 'record')
}, (input, args) => Outcome.makeSuccess([input, ...args]))
