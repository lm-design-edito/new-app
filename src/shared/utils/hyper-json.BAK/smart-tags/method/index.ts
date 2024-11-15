import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Utils } from '../../utils'
import { Types } from '../../types'
import { Generators } from '../../generators'
import { Cast } from '../../cast'

type Input = string | Text
type Args = ['coalescion' | 'isolation', ...Array<Types.Tree.MethodValue>]
type Output = Types.Tree.MethodValue

export const method = Utils.SmartTags.makeData<Input, Args, Output>('method', {
  inputCheck: i => Utils.typeCheck(i, 'string', 'text'),
  argsCheck: args => {
    const [modeArg, ...methodArgs] = args
    const modeArgChecked = Utils.typeCheck(modeArg, 'text', 'string')
    if (!modeArgChecked.success) {
      const { expected, found } = modeArgChecked.error
      return Utils.SmartTags.makeTypeCheckFailure('args', expected, found, 'First argument must be string or text', 0)
    }
    const strModeArg = Cast.toString(modeArgChecked.payload)
    if (strModeArg !== 'coalescion' && strModeArg !== 'isolation') {
      return Utils.SmartTags.makeTypeCheckFailure('args', `'coalescion' | 'isolation'`, strModeArg, 0)
    }
    const methodArgsChecked = Utils.typeCheckMany(methodArgs, 'method')
    if (!methodArgsChecked.success) return Outcome.makeFailure({
      ...methodArgsChecked.error,
      position: methodArgsChecked.error.position + 1
    })
    return Outcome.makeSuccess([strModeArg, ...methodArgsChecked.payload])
  },
  outputCheck: o => Utils.typeCheck(o, 'method')
}, (input, args, { sourceTree }) => {
  const [modeArg, ...methodArgs] = args
  const transformerFunc: Types.Generators.TransformerFunction = (inputForReturnedTransformerFunc: Types.Tree.Value) => {
    let output: Types.Tree.Value = inputForReturnedTransformerFunc
    for (const [argPos, argMethod] of Object.entries(methodArgs)) {
      const argMethodTransformationOutput = argMethod.transformer.apply(output)
      if (!argMethodTransformationOutput.success) return Outcome.makeFailure({
        message: 'Nested error',
        nestedTransformerName: argMethod.transformer.name,
        nestedTransformerPosition: parseInt(argPos),
        details: argMethodTransformationOutput.error
      })
      output = argMethodTransformationOutput.payload
    }
    return Outcome.makeSuccess(output)
  }
  const strInput = Cast.toString(input)
  const generated = Generators.make(strInput, transformerFunc, {
    inputCheck: i => Utils.typeCheck(i, ...Types.Tree.allTypesNames),
    argsCheck: a => Utils.typeCheckMany(a, ...Types.Tree.allTypesNames),
    outputCheck: o => Utils.typeCheck(o, ...Types.Tree.allTypesNames),
    mode: modeArg
  })([], sourceTree)
  return Outcome.makeSuccess(generated.method)
})  
