import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const toRef: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (currentValue, callerTree) => {
    const makeError = Utils.makeTransformerError
    const { Text } = Window.get()
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)) return makeError({
      message: 'Current value must be string or Text',
      input: currentValue
    })
    const refPathStr = Cast.toString(currentValue)
    const refPath = Utils.pathStringToPath(refPathStr)
    const foundTree = callerTree.resolve(refPath)
    if (foundTree === undefined) return makeError({
      message: 'Referenced value has not been found',
      input: refPathStr
    })
    const evaluated = foundTree.evaluate()
    if (typeof evaluated === 'function') return makeError({
      message: 'Cannot reference a transformer element.',
      found: evaluated
    })
    return {
      action: 'REPLACE',
      value: evaluated
    }
  })
}
