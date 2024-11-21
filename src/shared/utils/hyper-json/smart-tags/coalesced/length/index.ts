import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Types } from '../../../types'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'

type Main = string | Text | NodeListOf<Element | Text> | Element | Types.Tree.ArrayValue | Types.Tree.RecordValue
type Args = []
type Output = number

export const length = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'length',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'nodelist'),
  argsValueCheck: a => Utils.SmartTags.expectEmptyArgs(a),
  func: main => {
    const { Text, NodeList, Element } = Window.get()
    if (typeof main === 'string'
      || main instanceof NodeList
      || main instanceof Text
      || Array.isArray(main)) return Outcome.makeSuccess(main.length)
    if (main instanceof Element) return Outcome.makeSuccess(main.childNodes.length)
    return Outcome.makeSuccess(Object.keys(main).length)
  }
})
