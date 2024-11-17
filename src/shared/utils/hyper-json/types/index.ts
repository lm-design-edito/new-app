import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree as TreeNamespace } from '../tree'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'

export namespace Types {
  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * METHODS
   * 
   * * * * * * * * * * * * * * * * * * * * * */
  export namespace Methods {
    export type TransformationFailurePayload = {
      message: 'BAD_MAIN_VALUE',
      expected: string,
      found: string,
      mainValue: Types.Tree.Value,
      details?: any
    } | {
      message: 'BAD_ARGUMENTS_VALUE',
      expected: string,
      found: string,
      argumentsValue: Types.Tree.ArrayValue,
      at?: number
      details?: any
    } | {
      message: 'TRANSFORMATION_ERROR',
      details: any
    }

    export type TransformationSuccessPayload = null | boolean | number | string | Text | NodeListOf<Element | Text> | Element | Tree.MethodValue | Tree.ArrayValue | Tree.RecordValue
    export type TransformationOutput<
      S extends TransformationSuccessPayload = TransformationSuccessPayload,
      F extends TransformationFailurePayload = TransformationFailurePayload
    > = Outcome.Either<S, F>

    export type TransformerFunctionDetails = {
      name: string
      sourceTree: TreeNamespace.Tree
    }

    export type TransformerFunction<
      Main extends Tree.Value,
      Args extends Tree.ArrayValue,
      Output extends TransformationSuccessPayload
    > = (mainValue: Main, args: Args, details: TransformerFunctionDetails) => TransformationOutput<Output, TransformationFailurePayload>

    // [WIP] relocate this
    export class TEMP_Transformer<
      Main extends Tree.Value = Tree.Value,
      Args extends Tree.ArrayValue = Tree.ArrayValue,
      Output extends TransformationSuccessPayload = TransformationSuccessPayload
    > {
      name: string
      mode: Tree.Mode
      innerValue: Tree.Value
      typeChecks: {
        mainValue: (mainValue: Tree.Value) => Outcome.Either<Main, { expected: string, found: string }>
        argsValue: (argsValue: Tree.ArrayValue, mainValue: Main) => Outcome.Either<Args, { expected: string, found: string, at?: number }>
      }
      func: TransformerFunction<Main, Args, Output>
      sourceTree: TreeNamespace.Tree

      static clone <
        Main extends Tree.Value,
        Args extends Tree.ArrayValue,
        Output extends TransformationSuccessPayload
      >(transformer: TEMP_Transformer<Main, Args, Output>): TEMP_Transformer<Main, Args, Output> {
        const { name, mode, innerValue, typeChecks, func, sourceTree } = transformer
        return new TEMP_Transformer(name, mode, innerValue, typeChecks, func, sourceTree)
      }

      constructor (
        name: TEMP_Transformer<Main, Args, Output>['name'],
        mode: TEMP_Transformer<Main, Args, Output>['mode'],
        innerValue: TEMP_Transformer<Main, Args, Output>['innerValue'],
        typeChecks: TEMP_Transformer<Main, Args, Output>['typeChecks'],
        func: TEMP_Transformer<Main, Args, Output>['func'],
        sourceTree: TEMP_Transformer<Main, Args, Output>['sourceTree']
      ) {
        this.apply = this.apply.bind(this)
        this.name = name
        this.mode = mode
        this.innerValue = innerValue
        this.typeChecks = typeChecks
        this.func = func
        this.sourceTree = sourceTree
      }
      
      apply (outerValue: Tree.Value): TransformationOutput {
        const { mode, innerValue, typeChecks, func } = this
        const [mainValue, ...argumentsValue] = mode === 'isolation'
          ? (Array.isArray(innerValue) ? innerValue : [innerValue]) as [Tree.Value, ...Tree.Value[]]
          : [outerValue, Array.isArray(innerValue) ? innerValue : [innerValue]] as [Tree.Value, ...Tree.Value[]]
        const mainChecked = typeChecks.mainValue(mainValue)
        if (!mainChecked.success) return Outcome.makeFailure({
          message: 'BAD_MAIN_VALUE',
          ...mainChecked.error,
          mainValue
        })
        const validMainValue = mainChecked.payload
        const argsChecked = typeChecks.argsValue(argumentsValue, validMainValue)
        if (!argsChecked.success) return Outcome.makeFailure({
          message: 'BAD_ARGUMENTS_VALUE',
          ...argsChecked.error,
          argumentsValue
        })
        const validArgsValue = argsChecked.payload
        const called = func(validMainValue, validArgsValue, { name: this.name, sourceTree: this.sourceTree })
        if (!called.success) return Outcome.makeFailure(called.error)
        return Outcome.makeSuccess(called.payload)
      }
    }

    // [WIP] relocate this
    export class TEMP_Method<
      Main extends Tree.Value = Tree.Value,
      Args extends Tree.ArrayValue = Tree.ArrayValue,
      Output extends TransformationSuccessPayload = TransformationSuccessPayload
    > {
      transformer: TEMP_Transformer<Main, Args, Output>

      static clone <
        Main extends Tree.Value,
        Args extends Tree.ArrayValue,
        Output extends TransformationSuccessPayload
      >(method: TEMP_Method<Main, Args, Output>): TEMP_Method<Main, Args, Output> {
        const { transformer } = method
        return new TEMP_Method(transformer)
      }

      constructor (transformer: TEMP_Transformer<Main, Args, Output>) {
        this.transformer = transformer
      }
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * TREE
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace Tree {

    export namespace Merge {
      export enum Action {
        APPEND = 'append',
        PREPEND = 'prepend',
        REPLACE = 'replace'
      }
    }

    export type Mode = 'isolation' | 'coalescion'
    export const isMode = (name: string): name is Mode => name === 'isolation' || name === 'coalescion' // [WIP] maybe this should be in Utils.TypeChecks

    export type TransformerValue = Methods.TEMP_Transformer
    export type MethodValue = Methods.TEMP_Method
    export type PrimitiveValue = null | boolean | number | string | Text | NodeListOf<Element | Text> | Element | TransformerValue | MethodValue
    export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
    export type ArrayValue = Value[]
    export type RecordValue = { [k: string]: Value }
    export const isNull = (input: unknown): input is null => input === null
    export const isBoolean = (input: unknown): input is boolean => typeof input === 'boolean'
    export const isNumber = (input: unknown): input is number => typeof input === 'number'
    export const isString = (input: unknown): input is string => typeof input === 'string'
    export const isText = (input: unknown): input is Text => input instanceof Window.get().Text
    export const isElement = (input: unknown): input is Element => input instanceof Window.get().Element
    export const isNodeList = (input: unknown): input is NodeListOf<Element | Text> => input instanceof Window.get().NodeList
      && [...input].every(child => isText(child) || isElement(child))
    export const isTransformer = (input: unknown): input is Methods.TEMP_Transformer => input instanceof Methods.TEMP_Transformer
    export const isMethod = (input: unknown): input is Methods.TEMP_Method => input instanceof Methods.TEMP_Method
    export const isArray = (input: unknown): input is ArrayValue => Array.isArray(input)
      && input.every(isValue)
    export const isRecord = (input: unknown): input is RecordValue => isRecord(input)
      && Object.entries(input).every(([key, val]) => isValue(val))
    export const isValue = (input: unknown): input is Value => {
      return isNull(input)
        || isBoolean(input)
        || isNumber(input)
        || isString(input)
        || isText(input)
        || isElement(input)
        || isNodeList(input)
        || isTransformer(input)
        || isMethod(input)
        || isArray(input)
        || isRecord(input)
    }

    export type ValuesTypesNamesIndex = {
      null: null
      boolean: boolean
      number: number
      string: string
      text: Text
      nodelist: NodeListOf<Element | Text>
      element: Element
      transformer: TransformerValue
      method: MethodValue
      array: ArrayValue
      record: RecordValue
    }

    export type ValueTypeName = keyof ValuesTypesNamesIndex
    export const valueTypesNames: ValueTypeName[] = ['null', 'boolean', 'number', 'string', 'text', 'nodelist', 'element', 'transformer', 'method', 'array', 'record']
    export type ValueTypeFromNames<N extends ValueTypeName[]> = ValuesTypesNamesIndex[N[number]]
    export const isValueTypeName = (name: string): name is ValueTypeName => valueTypesNames.includes(name as any) // [WIP] maybe this should be in Utils.TypeChecks
  }
}
