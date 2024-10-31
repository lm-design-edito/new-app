import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Serialize } from '../../serialize'

export const print: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const getWindow = Window.get
    const { Text } = getWindow()
    const toPrint: Types.Value[] = []
    if (args.length === 0) toPrint.push(currentValue)
    else toPrint.push(...args)
    console.log(...toPrint.map(e => {
      if (e instanceof Text) return e.textContent
      return e
    }).map(Serialize.serialize))
    return { action: null }
  })
}
