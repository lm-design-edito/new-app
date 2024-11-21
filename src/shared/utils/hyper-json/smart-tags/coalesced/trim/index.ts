import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text
type Args = []
type Output = string | Text

export const trim = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'trim',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    return typeof main === 'string'
      ? Outcome.makeSuccess(main.trim())
      : Outcome.makeSuccess(Cast.toText(`${main}`.trim()))
  }
})
