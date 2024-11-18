import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree as TreeNamespace } from '../tree'
import { Types } from '../types'

export class Transformer<
  Main extends Types.Tree.Value = Types.Tree.Value,
  Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
  Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
> {
  name: string
  mode: Types.Tree.Mode
  innerValue: Types.Tree.Value
  typeChecks: {
    mainValue: (mainValue: Types.Tree.Value) => Outcome.Either<Main, { expected: string, found: string }>
    argsValue: (argsValue: Types.Tree.ArrayValue, mainValue: Main) => Outcome.Either<Args, { expected: string, found: string, at?: number }>
  }
  func: Types.Methods.TransformerFunction<Main, Args, Output>
  sourceTree: TreeNamespace.Tree

  static clone <
    Main extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Output extends Types.Methods.TransformationSuccessPayload
  >(transformer: Transformer<Main, Args, Output>): Transformer<Main, Args, Output> {
    const { name, mode, innerValue, typeChecks, func, sourceTree } = transformer
    return new Transformer(name, mode, innerValue, typeChecks, func, sourceTree)
  }

  constructor (
    name: Transformer<Main, Args, Output>['name'],
    mode: Transformer<Main, Args, Output>['mode'],
    innerValue: Transformer<Main, Args, Output>['innerValue'],
    typeChecks: Transformer<Main, Args, Output>['typeChecks'],
    func: Transformer<Main, Args, Output>['func'],
    sourceTree: Transformer<Main, Args, Output>['sourceTree']
  ) {
    this.apply = this.apply.bind(this)
    this.name = name
    this.mode = mode
    this.innerValue = innerValue
    this.typeChecks = typeChecks
    this.func = func
    this.sourceTree = sourceTree
  }
  
  apply (outerValue: Types.Tree.Value): Types.Methods.TransformationOutput {
    const { mode, innerValue, typeChecks, func, sourceTree } = this
    let mainValue: Types.Tree.Value
    let argumentsValue: Types.Tree.ArrayValue
    if (mode === 'isolation') {
      if (Array.isArray(innerValue)) {
        mainValue = innerValue.at(0) ?? []
        argumentsValue = innerValue.slice(1)
      } else {
        mainValue = innerValue
        argumentsValue = []
      }
    } else {
      mainValue = outerValue
      argumentsValue = Array.isArray(innerValue) ? innerValue : [innerValue]
    }
    const mainChecked = typeChecks.mainValue(mainValue)
    if (!mainChecked.success) return Outcome.makeFailure({
      message: 'BAD_MAIN_VALUE',
      ...mainChecked.error,
      mainValue,
      transformerName: this.name,
      path: sourceTree.pathString
    })
    const validMainValue = mainChecked.payload
    const argsChecked = typeChecks.argsValue(argumentsValue, validMainValue)
    if (!argsChecked.success) return Outcome.makeFailure({
      message: 'BAD_ARGUMENTS_VALUE',
      ...argsChecked.error,
      argumentsValue,
      transformerName: this.name,
      path: sourceTree.pathString
    })
    const validArgsValue = argsChecked.payload
    const called = func(validMainValue, validArgsValue, { name: this.name, sourceTree: this.sourceTree })
    if (!called.success) return Outcome.makeFailure(called.error)
    return Outcome.makeSuccess(called.payload)
  }
}
