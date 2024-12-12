import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Element | Array<Element>
type Args = [string | Text]
type Output = Element | Array<Element>

export const removeattribute = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'removeattribute',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { typeCheck, typeCheckMany } = Utils.Tree.TypeChecks
    if (Array.isArray(m)) return typeCheckMany(m, 'element')
    return typeCheck(m, 'element')
  },
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { typeCheckMany, getType } = Utils.Tree.TypeChecks
    const { makeArgsValueError } = Utils.SmartTags
    if (a.length === 0) return makeFailure(makeArgsValueError('string | Text', 'undefined', 0))
    if (a.length > 1) return makeFailure(makeArgsValueError('undefined', getType(a[2]) ?? 'undefined', 1))
    const checked = typeCheckMany(a, 'string', 'text')
    if (checked.success) return makeSuccess(checked.payload as Args)
    return checked
  },
  func: (main, args) => {
    const { makeSuccess } = Outcome
    const mainArr = Array.isArray(main) ? main : [main]
    const mainArrCloned = mainArr.map(e => Utils.clone(e))
    const name = Cast.toString(args[0])
    mainArrCloned.forEach(e => e.removeAttribute(name))
    if (Array.isArray(main)) return makeSuccess(mainArrCloned)
    return makeSuccess(mainArrCloned[0] as Element)
  }
})
