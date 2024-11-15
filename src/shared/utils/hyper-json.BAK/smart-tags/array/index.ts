import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'

type Input = Types.Tree.Value
type Args = Array<Types.Tree.Value>
type Output = Types.Tree.ArrayValue

export const array = Utils.SmartTags.makeData<Input, Args, Output>('array', {
  inputCheck: i => Utils.typeCheck(i, ...Types.Tree.allTypesNames),
  argsCheck: a => Utils.typeCheckMany(a, ...Types.Tree.allTypesNames),
  outputCheck: o => Utils.typeCheck(o, 'array')
}, (input, args) => Outcome.makeSuccess([input, ...args]))
