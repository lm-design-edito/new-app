import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text
type Args = []
type Output = Types.Tree.RestingValue

export const func: Types.Transformations.Function<Main, Args, Output> = (main, _args, { sourceTree }) => {
  const strMain = Cast.toString(main)
  const splitted = strMain.split('/').map(e => {
    const looksLikeNumber = e.match(/^\d+$/igm)
    if (looksLikeNumber === null) return e
    const parsed = parseInt(e)
    if (Number.isNaN(parsed)) return e
    return parsed
  })
  const resolved = sourceTree.resolve(splitted)
  const { makeTransformationError } = Utils.SmartTags
  if (resolved === undefined) return Outcome.makeFailure(makeTransformationError({ message: `No value was found at path: ${strMain}` }))
  const evaluated = resolved.evaluate()
  const { getType } = Utils.Tree.TypeChecks
  if (getType(evaluated) === 'transformer') {
    // [WIP] implemented this without thinking of what it means to reference a transformer node
    const transformer = evaluated as Types.Tree.TransformerValue
    return Outcome.makeSuccess(transformer.toMethod())
  }
  return Outcome.makeSuccess(evaluated as Types.Tree.RestingValue)
}

export const ref = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'ref',
  defaultMode: 'isolation',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func
})
