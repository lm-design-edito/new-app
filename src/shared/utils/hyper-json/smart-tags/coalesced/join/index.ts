import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.ArrayValue | NodeListOf<Element | Text>
type Args = Array<string | Text>
type Output = string

export const join = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'join',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array', 'nodelist'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    const joiner = Cast.toString(args)
    if (Array.isArray(main)) return Outcome.makeSuccess(main.map(Cast.toString).join(joiner))
    return Outcome.makeSuccess([...main].map(Cast.toString).join(joiner))
  }
})
