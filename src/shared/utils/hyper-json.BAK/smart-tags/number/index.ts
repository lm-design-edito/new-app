import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.NumberValue | Types.Tree.BooleanValue | Types.Tree.StringValue | Types.Tree.TextValue
type Args = []
type Output = Types.Tree.NumberValue

export const number = Utils.SmartTags.makeData<Input, Args, Output>('number', {
  initializer: () => false,
  inputCheck: i => Utils.typeCheck(i, 'number', 'boolean', 'string', 'text'),
  argsCheck: Utils.SmartTags.expectEmptyArgs,
  outputCheck: o => Utils.typeCheck(o, 'number')
}, input => Outcome.makeSuccess(Cast.toNumber(input)))
