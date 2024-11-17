import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'
import { SmartTags } from '..'

type Main = Types.Tree.Value
type Args = Types.Tree.ArrayValue
type Output = Types.Tree.ArrayValue

export const array = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'array',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => ({ success: true, payload: a }),
  func: (main, args) => {
    if (Array.isArray(main)) return Outcome.makeSuccess([...main, ...args])
    return Outcome.makeSuccess([main, ...args])
  }
})
