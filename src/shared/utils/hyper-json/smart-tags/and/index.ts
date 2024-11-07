import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isNotFalsy } from '@design-edito/tools/agnostic/booleans/is-falsy'
import { Utils } from '../../utils'
import { SmartTags } from '..'

export const and = SmartTags.makeData('and', {
  outputCheck: o => Utils.typeCheck(o, 'boolean')
}, (input, args) => {
  return [input, ...args].every(isNotFalsy)
    ? Outcome.makeSuccess(true)
    : Outcome.makeFailure(false)
})
