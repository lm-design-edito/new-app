import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../../cast'
import { Types } from '../../types'
import { Utils } from '../../utils'

enum Actions {
  ADD = 'add',
  REMOVE = 'remove',
  TOGGLE = 'toggle'
}

export const classList: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, currentValue => {
    const { Element } = Window.get()
    if (!(currentValue instanceof Element)) return Utils.makeTransformerError('Current value must be an Element')
    const [actionArg, classNameArg] = args
    if (actionArg === undefined || classNameArg === undefined) return Utils.makeTransformerError(`Expecting 2 arguments: (action: 'add' | 'remove' | 'toggle', classList: string)`)
    const action = Cast.toString(actionArg)
    const className = Cast.toString(actionArg).trim()
    if (action === Actions.ADD) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.add(className)
      return { action: 'REPLACE', value: outputValue }
    } else if (action === Actions.REMOVE) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.remove(className)
      return { action: 'REPLACE', value: outputValue }
    } else if (action === Actions.TOGGLE) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.toggle(className)
      return { action: 'REPLACE', value: outputValue }
    }
    return Utils.makeTransformerError(`Unknown action: ${action}`)
  })
}
