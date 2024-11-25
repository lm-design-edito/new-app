import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Method } from '../method'
import { Tree as TreeNamespace } from '../tree'
import { Types } from '../types'

export class Transformer<
  Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
  Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
  Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
> {
  name: string
  mode: Types.Tree.Mode
  innerValue: Types.Tree.RestingValue
  typeChecks: {
    mainValue: (mainValue: Types.Tree.RestingValue) => Outcome.Either<Main, {
      expected: string,
      found: string
    }>
    argsValue: (argsValue: Types.Tree.RestingArrayValue, mainValue: Main) => Outcome.Either<Args, {
      expected: string,
      found: string,
      position?: number
    }>
  }
  func: Types.Transformations.Function<Main, Args, Output>
  sourceTree: TreeNamespace.Tree

  static clone <
    Main extends Types.Tree.RestingValue,
    Args extends Types.Tree.RestingArrayValue,
    Output extends Types.Tree.RestingValue
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
    this.getMainAndArgsValue = this.getMainAndArgsValue.bind(this)
    this.makeMainValueError = this.makeMainValueError.bind(this)
    this.makeArgsValueError = this.makeArgsValueError.bind(this)
    this.makeTransformationError = this.makeTransformationError.bind(this)
    this.toMethod = this.toMethod.bind(this)
    this.name = name
    this.mode = mode
    this.innerValue = innerValue
    this.typeChecks = typeChecks
    this.func = func
    this.sourceTree = sourceTree
  }

  getMainAndArgsValue (outerValue: Types.Tree.RestingValue): {
    mainValue: Types.Tree.RestingValue
    argsValue: Types.Tree.RestingArrayValue
  } {
    const { mode, innerValue } = this
    let mainValue: Types.Tree.RestingValue
    let argsValue: Types.Tree.RestingArrayValue
    if (mode === 'isolation') {
      if (Array.isArray(innerValue)) {
        innerValue
        mainValue = innerValue.at(0) ?? []
        argsValue = innerValue.slice(1)
      } else {
        mainValue = innerValue
        argsValue = []
      }
    } else {
      mainValue = outerValue
      argsValue = Array.isArray(innerValue) ? innerValue : [innerValue]
    }
    return { mainValue, argsValue }
  }

  makeMainValueError (
    mainValue: Types.Tree.RestingValue,
    argsValue: Types.Tree.RestingArrayValue,
    expected: string,
    found: string,
    details?: any
  ): Types.Transformations.MainValueFailurePayload {
    const { name, sourceTree } = this
    return {
      message: 'BAD_MAIN_VALUE',
      expected,
      found,
      details,
      transformerName: name,
      path: sourceTree.pathString,
      mainValue,
      argsValue,
    }
  }

  makeArgsValueError (
    mainValue: Types.Tree.RestingValue,
    argsValue: Types.Tree.RestingArrayValue,
    expected: string,
    found: string,
    position?: number,
    details?: any
  ): Types.Transformations.ArgsValueFailurePayload {
    const { name, sourceTree } = this
    return {
      message: 'BAD_ARGUMENTS_VALUE',
      expected,
      found,
      position,
      details,
      transformerName: name,
      path: sourceTree.pathString,
      mainValue,
      argsValue,
    }
  }

  makeTransformationError (
    mainValue: Types.Tree.RestingValue,
    argsValue: Types.Tree.RestingArrayValue,
    details?: any
  ): Types.Transformations.TransformationFailurePayload {
    const { name, sourceTree } = this
    return {
      message: 'TRANSFORMATION_ERROR',
      details,
      transformerName: name,
      path: sourceTree.pathString,
      mainValue,
      argsValue,
    }
  }
  
  apply (outerValue: Types.Tree.RestingValue): Types.Transformations.Output {
    const {
      getMainAndArgsValue,
      typeChecks,
      makeMainValueError,
      makeArgsValueError,
      makeTransformationError,
      func
    } = this
    const { mainValue, argsValue } = getMainAndArgsValue(outerValue)
    const mainChecked = typeChecks.mainValue(mainValue)
    if (!mainChecked.success) return Outcome.makeFailure(makeMainValueError(
      mainValue,
      argsValue,
      mainChecked.error.expected,
      mainChecked.error.found
    ))
    const validMainValue = mainChecked.payload
    const argsChecked = typeChecks.argsValue(argsValue, validMainValue)
    if (!argsChecked.success) return Outcome.makeFailure(makeArgsValueError(
      mainValue,
      argsValue,
      argsChecked.error.expected,
      argsChecked.error.found,
      argsChecked.error.position
    ))
    const validArgsValue = argsChecked.payload
    const called = func(validMainValue, validArgsValue, { name: this.name, sourceTree: this.sourceTree })
    if (!called.success) return Outcome.makeFailure(makeTransformationError(
      mainValue,
      argsValue,
      called.error
    ))
    return Outcome.makeSuccess(called.payload)
  }

  toMethod (): Method<Main, Args, Output> {
    return new Method(this)
  }
}
