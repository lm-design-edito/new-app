import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Types.Tree.RecordValue
type Args = [string | Text]
type Output = Exclude<Types.Tree.Value, Types.Tree.TransformerValue>

export const getproperty = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'getproperty',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    if (a.length === 0) return Outcome.makeFailure({ position: 0, expected: 'string | Text', found: 'undefined' })
    if (a.length !== 1) return Outcome.makeFailure({ position: 1, expected: 'undefined', found: Utils.TypeChecks.getType(a.at(1)) ?? 'undefined' })
    const checked = Utils.TypeChecks.typeCheckMany(a, 'string', 'text')
    if (!checked.success) return checked
    return Outcome.makeSuccess(checked.payload as Args)
  },
  func: (main, args, { name, sourceTree }) => {
    const [propName] = args
    const strPropName = Cast.toString(propName)
    const val = main[strPropName]
    const valType = Utils.TypeChecks.getType(val)
    if (valType === undefined || valType === 'transformer') return Outcome.makeFailure({
      message: 'TRANSFORMATION_ERROR',
      transformerName: name,
      path: sourceTree.pathString,
      details: `Forbidden access to key: '${strPropName}'`
    })
    return Outcome.makeSuccess(val as Output)
  }
})
