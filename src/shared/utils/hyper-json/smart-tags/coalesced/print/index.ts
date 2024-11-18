import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Exclude<Types.Tree.Value, Types.Tree.TransformerValue>
type Args = Types.Tree.ArrayValue
type Output = Exclude<Types.Tree.Value, Types.Tree.TransformerValue>

export const print = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'print',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.getType(m) === 'transformer'
    ? Outcome.makeFailure({ expected: 'Exclude<value, transformer>', found: 'transformer' })
    : Outcome.makeSuccess(m as Main),
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
