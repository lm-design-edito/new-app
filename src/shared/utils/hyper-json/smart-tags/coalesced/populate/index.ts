import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { replaceAll } from '@design-edito/tools/agnostic/strings/replace-all'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'
import { deepGetProperty } from '../getproperty'

type Main = Types.Tree.RestingRecordValue
type FirstArg = string | Text | NodeListOf<Element | Text> | Element
type OtherArgs = [string | Text, string | Text]
type Args = [FirstArg, ...OtherArgs[]]
type Output = FirstArg

export const populate = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'populate',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'record'),
  argsValueCheck: a => {
    const [first, ...others] = a
    const { makeFailure, makeSuccess } = Outcome
    const { makeArgsValueError } = Utils.SmartTags
    const { typeCheck, typeCheckMany, getType } = Utils.Tree.TypeChecks
    const firstChecked = typeCheck(first, 'string', 'text', 'nodelist', 'element')
    if (!firstChecked.success) return makeFailure(makeArgsValueError(
      firstChecked.error.expected,
      firstChecked.error.found,
      0
    ))
    const othersChecked = typeCheckMany(others, 'array')
    if (!othersChecked.success) return makeFailure(makeArgsValueError(
      othersChecked.error.expected,
      othersChecked.error.found,
      othersChecked.error.position + 1
    ))
    for (const [argPos, arg] of Object.entries(othersChecked.payload)) {
      const argPosNum = parseInt(argPos)
      const [first, second] = arg
      const firstChecked = typeCheck(first, 'string', 'text')
      const secondChecked = typeCheck(second, 'string', 'text')
      if (!firstChecked.success || !secondChecked.success) return makeFailure(makeArgsValueError(
        '[string | Text, string | Text]',
        `[${getType(first)}, ${getType(second)}]`,
        argPosNum + 1
      ))
    }
    return makeSuccess(a as Args)
  },
  func: (main, args) => {
    const { makeSuccess, makeFailure } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const record = main
    const [template, ...actions] = args
    let returnedStr = Cast.toString(template)
    for (const [propName, toReplace] of actions) {
      try {
        const value = deepGetProperty(record, Cast.toString(propName))
        const replaced = replaceAll(returnedStr, Cast.toString(toReplace), Cast.toString(value))
        returnedStr = replaced
      } catch (err) {
        return makeFailure(makeTransformationError({
          message: 'Something went wrong',
          subTransformerError: err
        }))
      }
    }
    const { Text, NodeList } = Window.get()
    if (typeof template === 'string') return makeSuccess(returnedStr)
    if (template instanceof Text) return makeSuccess(Cast.toText(returnedStr))
    if (template instanceof NodeList) return makeSuccess(Cast.toNodeList(returnedStr))
    return makeSuccess(Cast.toElement(returnedStr))
  }
})
