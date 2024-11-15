import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Cast } from '../../cast'

type Input = Types.Tree.Value
type Args = []
type Output = Types.Tree.BooleanValue

export const boolean = Utils.SmartTags.makeData<Input, Args, Output>('boolean', {
  initializer: () => false,
  argsCheck: Utils.SmartTags.expectEmptyArgs,
  outputCheck: o => Utils.typeCheck(o, 'boolean')
}, input => Outcome.makeSuccess(Cast.toBoolean(input)))
