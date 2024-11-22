import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Types.Tree.RestingArrayValue
type Output = Types.Tree.RestingValue

export const print = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'print',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { getType } = Utils.Tree.TypeChecks
    const { makeSuccess, makeFailure } = Outcome
    const { makeMainValueError } = Utils.SmartTags
    return getType(m) === 'transformer'
      ? makeFailure(makeMainValueError('Exclude<value, transformer>', 'transformer'))
      : makeSuccess(m as Main)
  },
  argsValueCheck: a => Outcome.makeSuccess(a),
  func: (main, args, details) => {
    console.log(
      main,
      args.length === 0
        ? { tree: details.sourceTree }
        : { args, tree: details.sourceTree }
    )
    return Outcome.makeSuccess(main)
  }
})
