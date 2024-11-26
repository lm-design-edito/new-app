import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text | Types.Tree.RestingArrayValue | NodeListOf<Element | Text>
type Args = [number | string | Text]
type Output = Types.Tree.RestingValue

export const at = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'at',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text', 'array', 'nodelist'),
  argsValueCheck: a => {
    const { makeArgsValueError } = Utils.SmartTags
    const { getType, typeCheckMany } = Utils.Tree.TypeChecks
    if (a.length === 0) return Outcome.makeFailure(makeArgsValueError('number | string | text', 'undefined', 0))
    if (a.length > 1) return Outcome.makeFailure(makeArgsValueError('undefined', getType(a[1]) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'number', 'string', 'text')
    if (checked.success) return Outcome.makeSuccess(a as Args)
    return checked
  },
  func: (main, args) => {
    const { makeTransformationError } = Utils.SmartTags
    const pos = args[0]
    const numPos = Cast.toNumber(pos)
    let found: Types.Tree.RestingValue | undefined
    const { NodeList } = Window.get()
    if (typeof main === 'string'
      || Array.isArray(main)
      || main instanceof NodeList) { found = main[numPos] }
    else {
      const strMain = Cast.toString(main)
      found = strMain[numPos]
    }
    if (found === undefined) return Outcome.makeFailure(makeTransformationError({
      message: 'Property does not exist'
      // [WIP] maybe more details here ?
    }))
    return Outcome.makeSuccess(found)
  }
})
