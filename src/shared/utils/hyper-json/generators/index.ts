import { Tree } from '../tree'
import { Types } from '../types'
import { Utils } from '../utils'

export namespace Generators {

  /* * * * * * * * * * * * * * * * * * * * *
  *
  * UTILS
  * 
  * * * * * * * * * * * * * * * * * * * * */

  const makeError = (value: Types.Tree.Value): Types.Generators.TransformationFailure => ({ success: false, value })
  const makeSuccess = (value: Types.Tree.Value): Types.Generators.TransformationSuccess => ({ success: true, value })
  const makeOutput = (success: boolean, value: Types.Tree.Value) => ({ success, value })
  
  type TypeCheckSuccess<K extends Array<keyof Types.Tree.ValueTypesIndex>> = {
    success: true,
    value: Types.Tree.ValueType<K>
  }
  type TypeCheckFailure = {
    success: false,
    message: string
  }
  export function typeCheck<K extends Array<keyof Types.Tree.ValueTypesIndex>> (
    value: unknown,
    ...types: K
  ): TypeCheckSuccess<K> | TypeCheckFailure {
    const checked = Utils.typeCheck(value, ...types)
    if (checked) return { success: true, value }
    return {
      success: false,
      message: `Expected type ${types.join(' | ')}, found: ${Utils.getType(value)}`
    }
  }
  
  /* * * * * * * * * * * * * * * * * * * * *
   *
   * TRANSFORMER
   * 
   * * * * * * * * * * * * * * * * * * * * */

  export class Transformer {
    name: string
    args: Types.Tree.Value[]
    func: Types.Generators.TransformerFunction
    sourceTree: Tree.Tree
    mode: Tree.Tree['mode']
    inputTypes: Array<Types.Tree.ValueTypeName> | null
    outputTypes: Array<Types.Tree.ValueTypeName> | null

    static clone (transformer: Transformer): Transformer {
      const { name, args, func, sourceTree } = transformer
      return new Transformer(name, args, func, sourceTree)
    }

    constructor (
      name: string,
      args: Types.Tree.Value,
      func: Types.Generators.TransformerFunction,
      sourceTree: Tree.Tree,
      options?: Types.Generators.TransformerOptions) {
      this.callFunc = this.callFunc.bind(this)
      this.silentApply = this.silentApply.bind(this)
      this.apply = this.apply.bind(this)
      this.name = name
      this.args = Array.isArray(args) ? args : [args]
      this.func = func
      this.sourceTree = sourceTree
      this.mode = sourceTree.mode
      this.inputTypes = options?.inputTypes ?? null
      this.outputTypes = options?.outputTypes ?? null
    }

    callFunc (input: Types.Tree.Value, ...args: Types.Tree.Value[]): Types.Generators.TransformationOutput {
      const { name, func, sourceTree, inputTypes, outputTypes } = this
      let output: Types.Tree.Value
      if (inputTypes === null) { output = func(input, args, { name, sourceTree }) }
      else {
        const inputChecked = typeCheck(input, ...inputTypes)
        if (!inputChecked.success) return makeError(`Input type check failed: ${inputChecked.message}`)
        output = func(input, args, { name, sourceTree })
      }
      if (outputTypes === null) return makeSuccess(output)
      const outputChecked = typeCheck(output, ...outputTypes)
      if (!outputChecked.success) return makeError(`IMPLEMENTATION ERROR: ${outputChecked.message}`)
      return makeSuccess(outputChecked.value)
    }

    private silentApply (input: Types.Tree.Value): Types.Generators.TransformationOutput {
      const { args, mode } = this
      if (mode === 'coalescion') {
        const called = this.callFunc(input, ...args)
        if (called.success) return makeSuccess(called.value)
        return makeError(called.value)
      }
      const [firstArg, ...otherArgs] = args
      if (firstArg === undefined) return makeError('Tranformers in isolation mode require at least one argument.')
      const called = this.callFunc(firstArg, ...otherArgs)
      if (called.success) return makeSuccess(called.value)
      return makeError(called.value)
    }

    apply (input: Types.Tree.Value): Types.Generators.TransformationOutput {
      const { sourceTree, name, silentApply } = this
      const silentResult = silentApply(input)
      if (!silentResult.success) console.warn('Transformation error:', {
        at: sourceTree.pathString,
        transformer: name,
        tree: sourceTree,
        details: silentResult.value
      })
      return silentResult
    }
  }

  /* * * * * * * * * * * * * * * * * * * * *
   *
   * FUNCTION
   * 
   * * * * * * * * * * * * * * * * * * * * */

  export class Method {
    transformer: Transformer

    static clone (method: Method): Method {
      const { transformer } = method
      return new Method(transformer)
    }

    constructor (transformer: Transformer) {
      this.transformer = transformer
    }
  }

  /* * * * * * * * * * * * * * * * * * * * *
   *
   * GENERATOR MAKER
   * 
   * * * * * * * * * * * * * * * * * * * * */
  export function make (
    name: string,
    func: Types.Generators.TransformerFunction | undefined,
    options?: Types.Generators.TransformerOptions) {
    return func !== undefined && ((wrapped: Types.Tree.Value, sourceTree: Tree.Tree) => {
      const transformer = new Generators.Transformer(name, wrapped, func, sourceTree, options)
      const method = new Generators.Method(transformer)
      return { transformer, method }
    }) || undefined
  }
}
