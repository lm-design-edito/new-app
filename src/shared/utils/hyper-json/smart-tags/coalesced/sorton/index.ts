import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { Types } from '../../../types'
import { SmartTags } from '../..'

type Main = Array<Types.Tree.RestingRecordValue>
type Args = [string | Text]
type Output = Main

export const sorton = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'sorton',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => {
    const { makeMainValueError } = Utils.SmartTags
    const { getType } = Utils.Tree.TypeChecks
    if (!Array.isArray(m)) return Outcome.makeFailure(makeMainValueError('array<record>', getType(m) ?? 'undefined'))
    for (const [itemPos, itemVal] of Object.entries(m)) {
      if (isRecord(itemVal)) continue
      return Outcome.makeFailure(makeMainValueError('record', getType(itemVal), `At position ${parseInt(itemPos)} in main value`))
    }
    return Outcome.makeSuccess(m as Main)
  },
  argsValueCheck: a => {
    const { makeArgsValueError } = Utils.SmartTags
    const { getType } = Utils.Tree.TypeChecks
    if (a.length === 0) return Outcome.makeFailure(makeArgsValueError('[string | text]', '[]', 0))
    if (a.length > 1) return Outcome.makeFailure(makeArgsValueError('undefined', getType(a[1]) ?? 'undefined', 2))
    const checked = Utils.Tree.TypeChecks.typeCheckMany(a as Args, 'string', 'text')
    if (checked.success) return Outcome.makeSuccess(checked.payload as Args)
    return checked
  },
  func: (main, args) => {
    const strPropName = Cast.toString(args[0])
    const { getType } = Utils.Tree.TypeChecks
    const { makeTransformationError } = Utils.SmartTags
    const map = main.map(record => {
      const prop = record[strPropName]
      const type = getType(prop)
      return { record, prop, type }
    })
    const firstItem = map[0]
    if (firstItem === undefined) return Outcome.makeSuccess([])
    const firstItemType = firstItem.type
    if (firstItemType === undefined) return Outcome.makeFailure(makeTransformationError({
      message: 'Invalid property type',
      onItem: 0,
      found: firstItemType
    }))
    for (const [daytumPos, daytumVal] of Object.entries(map)) {
      if (daytumVal.type !== firstItemType) return Outcome.makeFailure(makeTransformationError({
        message: 'Invalid property type',
        onItem: parseInt(daytumPos),
        expected: firstItemType,
        found: daytumVal.type
      }))
    }
    const sorted = main.sort((a, b) => {
      const { Text, NodeList } = Window.get()
      const aProp = a[strPropName] as Types.Tree.RestingValue
      const bProp = b[strPropName] as typeof aProp
      if (aProp === null) return 0
      if (typeof aProp === 'boolean') {
        if (aProp === bProp) return 0
        if (aProp) return 1
        return -1
      }
      if (typeof aProp === 'string') return aProp.localeCompare(Cast.toString(bProp))
      if (aProp instanceof Text) return Cast.toString(aProp).localeCompare(Cast.toString(bProp))
      if (typeof aProp === 'number') return aProp - Cast.toNumber(bProp)
      if (Array.isArray(aProp)) return aProp.length - Cast.toArray(bProp).length
      if (aProp instanceof NodeList) return aProp.length - Cast.toNodeList(bProp).length
      return 0
    })
    return Outcome.makeSuccess(sorted)
  }
})
