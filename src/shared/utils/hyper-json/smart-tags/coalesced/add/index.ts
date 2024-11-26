import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = number | string | Text
type Args = Array<number | string | Text>
type Output = number

export const add = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'add',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'number', 'string', 'text'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'number', 'string', 'text'),
  func: (main, args) => {
    const numMain = Cast.toNumber(main)
    const numArgs = args.map(Cast.toNumber)
    return Outcome.makeSuccess(numArgs.reduce((reduced, arg) => (reduced + arg), numMain))
  }
})
