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
  wrapper: Cast.toBoolean,
  argsCheck: Utils.SmartTags.expectEmptyArgs,
  outputCheck: o => Utils.typeCheck(o, 'boolean')
}, (input) => {
  const { Text } = Window.get()
  if (typeof input === 'boolean') return Outcome.makeSuccess(input)
  if (typeof input === 'string') return Outcome.makeSuccess(input.trim().toLowerCase() === 'true')
  if (input instanceof Text) return Outcome.makeSuccess(input.textContent?.trim().toLowerCase() === 'true')
  if (typeof input === 'number') return Outcome.makeSuccess(input === 1)
  return Outcome.makeSuccess(false)
})
