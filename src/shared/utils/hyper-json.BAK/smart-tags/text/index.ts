import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Cast } from '../../cast'

type Input = string | number | null | boolean | Text | Element | NodeListOf<Element | Text>
type Args = Array<string | number | null | boolean | Text | Element | NodeListOf<Element | Text>>
type Output = Text

export const text = Utils.SmartTags.makeData<Input, Args, Output>('text', {
  inputCheck: i => Utils.typeCheck(i, 'string', 'number', 'null', 'boolean', 'text', 'element', 'nodelist'),
  argsCheck: args => {
    for (const [argPos, argValue] of Object.entries(args)) {
      const argChecked = Utils.typeCheck(argValue, 'string', 'number', 'null', 'boolean', 'text', 'element', 'nodelist')
      if (!argChecked.success) {
        const { expected, found } = argChecked.error
        return Utils.SmartTags.makeTypeCheckFailure('args', expected, found, parseInt(argPos))
      }
    }
    return Outcome.makeSuccess(args as Args)
  },
  outputCheck: o => Utils.typeCheck(o, 'text')
}, (input, args) => Outcome.makeSuccess(Cast.toText([input, ...args])))
