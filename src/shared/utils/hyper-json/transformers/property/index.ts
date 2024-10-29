import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const property: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  const makeError = Utils.makeTransformerError
  const getWindow = Window.get
  return Utils.toNamedTransformer(callerTagName, args, (currentValue, callerTree) => {
    const { Text } = getWindow()
    if (!isRecord(currentValue)) return makeError('Input value must be a Record')
    const [firstPathChunk, ...otherPathChunks] = args
    if (typeof firstPathChunk !== 'string'
      && !(firstPathChunk instanceof Text)) return makeError(`Property name must be a string or a Text. Found: ${firstPathChunk}`)
    const firstPathChunkStr = Cast.toString(firstPathChunk)
    const found = currentValue[firstPathChunkStr]
    if (found === undefined) return makeError({
      message: `Property ${firstPathChunk} is not defined`,
      record: currentValue
    })
    if (typeof found === 'function') return makeError({
      message: 'Cannot access a transformer property',
      property: found
    })
    if (otherPathChunks.length === 0) return {
      action: 'REPLACE',
      value: found
    }
    const thisGenerator = property(callerTagName, ...otherPathChunks)
    return thisGenerator(found, callerTree)
  })
}
