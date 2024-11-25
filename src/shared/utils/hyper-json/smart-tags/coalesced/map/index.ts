import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingArrayValue
type Args = Array<Types.Tree.MethodValue>
type Output = Types.Tree.RestingArrayValue

export const map = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'map',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'array'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'method'),
  func: (main, args) => {
    const { makeTransformationError } = Utils.SmartTags
    let mapped: Types.Tree.RestingArrayValue = []
    for (const val of main) {
      let reduced: Types.Tree.RestingValue = val
      for (const arg of args) {
        const { transformer } = arg
        const applied = transformer.apply(reduced)
        if (!applied.success) return Outcome.makeFailure(makeTransformationError({
          message: 'Subtransformation failure.',
          onTransformed: reduced,
          transformerAt: args.indexOf(arg),
          transformerName: transformer.name,
          transformerInput: reduced,
          transformerOutput: applied
        }))
        reduced = applied.payload
      }
      mapped.push(reduced)
    }
    return Outcome.makeSuccess(mapped)
  }
})
