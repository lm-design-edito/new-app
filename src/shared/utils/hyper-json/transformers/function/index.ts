import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Types } from '../../types'
import { Utils } from '../../utils'
import { Cast } from '../../cast'

export const functionFunc: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (currentValue, callerTree) => {
    const [rawTransformerName, rawTransformerArgs] = args
    const { Text } = Window.get()
    const makeError = Utils.makeTransformerError
    if (typeof rawTransformerName !== 'string'
      && !(rawTransformerName instanceof Text)) return makeError({
      message: 'First argument for function transformer must be a string',
      found: rawTransformerName === undefined ? '<undefined>' : rawTransformerName
    })
    const transformerName = Cast.toString(rawTransformerName)
    const generator = callerTree.getGenerator(transformerName)
    if (generator === undefined) return makeError(`Cannot find a transformer named ${transformerName}`)
    if (!Array.isArray(rawTransformerArgs)
      && rawTransformerArgs !== undefined) return makeError({
      message: 'Second argument for function transformer must be an array or undefined',
      found: rawTransformerArgs
    })
    const transformerArgs = [...(rawTransformerArgs ?? [])]
    const transformer = generator(transformerName, ...transformerArgs)
    return {
      action: 'REPLACE',
      value: transformer
    }
  })
}
