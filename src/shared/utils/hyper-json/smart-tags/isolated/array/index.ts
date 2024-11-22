import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingArrayValue

export const array = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'array',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args) => {
    if (Array.isArray(main)) return Outcome.makeSuccess([...main, ...args])
    return Outcome.makeSuccess([main, ...args])
  }
})
