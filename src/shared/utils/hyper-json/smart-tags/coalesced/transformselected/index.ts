import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { insertNode } from '@design-edito/tools/agnostic/html/insert-node'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Element | NodeListOf<Element | Text>
type Args = [
  selector: string | Text,
  ...methods: Types.Tree.MethodValue[]
]
type Output = Element | NodeListOf<Element | Text>

export const transformselected = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'transformselected',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'element', 'nodelist'),
  argsValueCheck: a => {
    const { makeFailure, makeSuccess } = Outcome
    const { typeCheck, typeCheckMany } = Utils.Tree.TypeChecks
    const [first, ...others] = a
    const firstChecked = typeCheck(first, 'string', 'text')
    if (!firstChecked.success) return makeFailure({ ...firstChecked.error, position: 0 })
    const othersChecked = typeCheckMany(others, 'method')
    if (!othersChecked.success) return makeFailure({
      ...othersChecked.error,
      position: othersChecked.error.position + 1
    })
    const returned = [firstChecked.payload, ...othersChecked.payload] as Args
    return makeSuccess(returned)
  },
  func: (main, args, details) => {
    const { makeFailure, makeSuccess } = Outcome
    const { makeTransformationError } = Utils.SmartTags
    const { typeCheck } = Utils.Tree.TypeChecks
    const mainClone = Cast.toElement(main)
    const [selector, ...methods] = args
    const selectedElements = [...mainClone.querySelectorAll(Cast.toString(selector))]
    const transformationMap = new Map<Element, Types.Tree.RestingValue>(selectedElements.map(s => ([s, s])))
    for (const method of methods) {
      for (const [selected, value] of transformationMap) {
        const transformer = method.transformer
        const applied = transformer.apply(value)
        if (!applied.success) return makeFailure(makeTransformationError({
          // [WIP] maybe a custom makeSubTransformationError ?
          message: 'Subtransformation failure.',
          onSelected: selected,
          onTransformed: value,
          transformerAt: methods.indexOf(method),
          transformerName: transformer.name,
          transformerOutput: applied
        }))
        transformationMap.set(selected, applied.payload)
      }
    }
    for (const [selected, transformed] of transformationMap) {
      const transformedChecked = typeCheck(transformed, 'element', 'nodelist', 'text', 'string', 'number', 'boolean', 'null')
      if (!transformedChecked.success) return makeFailure(makeTransformationError({
        // [WIP] maybe a custom makeBadTransformationOutputError ?
        message: 'Bad transformation output',
        onSelected: selected,
        onTransformed: transformed,
        details: { ...transformedChecked.error }
      }))
      const { Element, NodeList, Text } = Window.get()
      const replacer = transformedChecked.payload
      if (replacer instanceof Element || replacer instanceof Text) {
        insertNode(replacer, 'after', selected)
        selected.remove()
      } else if (replacer instanceof NodeList) {
        replacer.forEach(item => insertNode(item, 'before', selected))
        selected.remove()
      } else {
        insertNode(Cast.toText(replacer), 'after', selected)
        selected.remove()
      }
      transformedChecked.payload
    }
    if (main instanceof Element) return makeSuccess(mainClone)
    const safeChildren = Array.from(mainClone.childNodes)
      .filter((e): e is Element | Text => e instanceof Element || e instanceof Text)
    return main instanceof Element
      ? makeSuccess(mainClone)
      : makeSuccess(Cast.toNodeList(safeChildren))
  }
})
