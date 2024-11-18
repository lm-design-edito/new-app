import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree as TreeNamespace } from '../tree'
import { Transformer } from '../transformer'
import { Method } from '../method'

export namespace Types {
  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * METHODS
   * 
   * * * * * * * * * * * * * * * * * * * * * */
  export namespace Methods {
    export type TransformationFailurePayload = {
      message: 'BAD_MAIN_VALUE',
      transformerName: string,
      path: string,
      expected: string,
      found: string,
      mainValue: Types.Tree.Value,
      details?: any
    } | {
      message: 'BAD_ARGUMENTS_VALUE',
      transformerName: string,
      path: string,
      expected: string,
      found: string,
      argumentsValue: Types.Tree.ArrayValue,
      at?: number
      details?: any
    } | {
      message: 'TRANSFORMATION_ERROR',
      transformerName: string,
      path: string,
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
      Main extends Tree.Value, // [WIP] Should never expect Transformers here...
      Args extends Tree.ArrayValue, // [WIP] probably neither here
      Output extends TransformationSuccessPayload
    > = (mainValue: Main, args: Args, details: TransformerFunctionDetails) => TransformationOutput<Output, TransformationFailurePayload>
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
    export type TransformerValue = Transformer
    export type MethodValue = Method
    export type PrimitiveValue = null | boolean | number | string | Text | NodeListOf<Element | Text> | Element | TransformerValue | MethodValue
    export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
    export type ArrayValue = Value[]
    export type RecordValue = { [k: string]: Value }

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
    export type ValueTypeFromNames<N extends ValueTypeName[]> = ValuesTypesNamesIndex[N[number]]
  }

  export namespace SmartTags {
    export type SmartTag<
      Main extends Types.Tree.Value = Types.Tree.Value,
      Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
      Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
    > = {
      defaultMode: Types.Tree.Mode
      isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>
      generator: (innerValue: Types.Tree.Value, mode: Types.Tree.Mode, sourceTree: TreeNamespace.Tree) => {
        transformer: Transformer<Main, Args, Output>,
        method: Method<Main, Args, Output>
      }
    }

    export type Descriptor<
      Main extends Types.Tree.Value = Types.Tree.Value,
      Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
      Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
    > = {
      name: string,
      defaultMode: Types.Tree.Mode,
      isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>,
      mainValueCheck: Transformer<Main, Args, Output>['typeChecks']['mainValue'],
      argsValueCheck: Transformer<Main, Args, Output>['typeChecks']['argsValue'],
      func: Transformer<Main, Args, Output>['func']
    }

    export type Register = Map<string, Types.SmartTags.SmartTag<any, any, any>>
  }
}
