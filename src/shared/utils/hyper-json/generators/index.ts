import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree } from '../tree'
import { Types } from '../types'
import { Utils } from '../utils'
// import { Utils } from '../utils'

export namespace Generators {

  /* * * * * * * * * * * * * * * * * * * * *
  *
  * UTILS
  * 
  * * * * * * * * * * * * * * * * * * * * */

  const makeError = (value: Types.Tree.Value): Types.Generators.TransformationFailure => Outcome.makeFailure(value)
  const makeSuccess = (value: Types.Tree.Value): Types.Generators.TransformationSuccess => Outcome.makeSuccess(value)
  
  /* * * * * * * * * * * * * * * * * * * * *
   *
   * TRANSFORMER
   * 
   * * * * * * * * * * * * * * * * * * * * */

  export const makeTransformerOptions = <
    In extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Out extends Types.Tree.Value
  >(
    options: Partial<Types.Generators.TransformerOptions<In, Args, Out>>
  ): Types.Generators.TransformerOptions<In, Args, Out> => {
    return {
      inputCheck: options.inputCheck ?? ((i): Outcome.Success<In> => Outcome.makeSuccess(i as In)),
      argsCheck: options.argsCheck ?? ((i): Outcome.Success<Args> => Outcome.makeSuccess(i as Args)),
      outputCheck: options.outputCheck ?? ((i): Outcome.Success<Out> => Outcome.makeSuccess(i as Out))
    }
  }

  export class Transformer<
    In extends Types.Tree.Value = Types.Tree.Value,
    Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
    Out extends Types.Tree.Value = Types.Tree.Value
  > {
    name: string
    args: Types.Tree.Value[]
    func: Types.Generators.TransformerTypedFunction<In, Args, Out>
    sourceTree: Tree.Tree
    mode: Tree.Tree['mode']
    options: Types.Generators.TransformerOptions<In, Args, Out>

    static clone (transformer: Transformer): Transformer {
      const { name, args, func, sourceTree, options } = transformer
      return new Transformer(name, args, func, sourceTree, options)
    }

    constructor (
      name: string,
      args: Types.Tree.Value,
      func: Types.Generators.TransformerTypedFunction<In, Args, Out>,
      sourceTree: Tree.Tree,
      options: Partial<Types.Generators.TransformerOptions<In, Args, Out>> = {}
    ) {
      this.callFunc = this.callFunc.bind(this)
      this.silentApply = this.silentApply.bind(this)
      this.apply = this.apply.bind(this)
      this.name = name
      this.args = Array.isArray(args) ? args : [args]
      this.func = func
      this.sourceTree = sourceTree
      this.mode = sourceTree.mode
      this.options = makeTransformerOptions(options)
    }

    callFunc (input: Types.Tree.Value, ...args: Types.Tree.Value[]): Types.Generators.TransformationOutput {
      const { name, func, sourceTree } = this
      const inputChecked = this.options.inputCheck(input)
      if (!inputChecked.success) throw 0
      const argsChecked = this.options.argsCheck(args)
      if (!argsChecked.success) throw 0
      const output = func(inputChecked.payload, argsChecked.payload, { name, sourceTree })
      if (output.success) {
        const outputChecked = this.options.outputCheck(output.payload)
        if (!outputChecked.success) throw 0
        return makeSuccess(outputChecked.payload)
      }
      return makeError(output.error)
    }

    private silentApply (input: Types.Tree.Value): Types.Generators.TransformationOutput {
      const { args, mode } = this
      if (mode === 'coalescion') {
        const called = this.callFunc(input, ...args)
        if (called.success) return makeSuccess(called.payload)
        return makeError(called.error)
      }
      const [firstArg, ...otherArgs] = args
      if (firstArg === undefined) return makeError('Tranformers in isolation mode require at least one argument.')
      const called = this.callFunc(firstArg, ...otherArgs)
      if (called.success) return makeSuccess(called.payload)
      return makeError(called.error)
    }

    apply (input: Types.Tree.Value): Types.Generators.TransformationOutput {
      const { sourceTree, name, silentApply } = this
      const silentResult = silentApply(input)
      if (!silentResult.success) console.warn('Transformation error:', {
        at: sourceTree.pathString,
        transformer: name,
        tree: sourceTree,
        details: silentResult.error
      })
      return silentResult
    }
  }

  /* * * * * * * * * * * * * * * * * * * * *
   *
   * METHOD
   * 
   * * * * * * * * * * * * * * * * * * * * */

  export class Method<
    In extends Types.Tree.Value = Types.Tree.Value,
    Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
    Out extends Types.Tree.Value = Types.Tree.Value
  > {
    transformer: Transformer<In, Args, Out>

    static clone <
      In extends Types.Tree.Value,
      Args extends Types.Tree.ArrayValue,
      Out extends Types.Tree.Value
    >(method: Method<In, Args, Out>): Method<In, Args, Out> {
      const { transformer } = method
      return new Method(transformer)
    }

    constructor (transformer: Transformer<In, Args, Out>) {
      this.transformer = transformer
    }
  }

  /* * * * * * * * * * * * * * * * * * * * *
   *
   * GENERATOR MAKER
   * 
   * * * * * * * * * * * * * * * * * * * * */
  export function make <
    In extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Out extends Types.Tree.Value
  >(
    name: string,
    func: Types.Generators.TransformerTypedFunction<In, Args, Out>,
    options: Types.Generators.TransformerOptions<In, Args, Out>
  ): Types.Generators.Generator {
    return (wrapped: Types.Tree.Value, sourceTree: Tree.Tree) => {
      const transformer = new Transformer(name, wrapped, func, sourceTree, options) as unknown as Transformer
      const method = new Method(transformer) as unknown as Method
      return { transformer, method }
    }
  }

}
