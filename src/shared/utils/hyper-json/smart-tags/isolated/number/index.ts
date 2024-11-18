import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = null | boolean | number | string | Text
type Args = Array<null | boolean | number | string | Text>
type Output = number

export const number = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'number',
  defaultMode: 'isolation',
  isolationInitType: 'number',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'null', 'boolean', 'number', 'string', 'text'),
  argsValueCheck: a => Utils.TypeChecks.typeCheckMany(a, 'null', 'boolean', 'number', 'string', 'text'),
  func: (main, args) => {
    const all = [main, ...args]
    const reduced = all.reduce<number>((reduced, curr) => {
      return reduced + Cast.toNumber(curr)
    }, 0)
    return Outcome.makeSuccess(reduced)
  }
})
