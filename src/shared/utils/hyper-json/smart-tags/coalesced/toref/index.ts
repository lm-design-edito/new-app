import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'
import { func as refFunc } from '../../isolated/ref'

type Main = Types.Tree.RestingValue
type Args = []
type Output = Types.Tree.RestingValue

export const toref = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toref',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: (main, args, details) => refFunc(Cast.toString(main), args, details)
})
