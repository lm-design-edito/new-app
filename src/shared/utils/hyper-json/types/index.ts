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
  export namespace Transformations {
    export type FailurePayload = {
      message: 'BAD_MAIN_VALUE',
      transformerName: string,
      path: string,
      expected: string,
      found: string,
      mainValue: Tree.RestingValue,
      details?: any
    } | {
      message: 'BAD_ARGUMENTS_VALUE',
      transformerName: string,
      path: string,
      expected: string,
      found: string,
      argumentsValue: Tree.RestingValue,
      at?: number
      details?: any
    } | {
      message: 'TRANSFORMATION_ERROR',
      transformerName: string,
      path: string,
      details: any
    }

    export type Output<
      S extends Tree.RestingValue = Tree.RestingValue,
      F extends FailurePayload = FailurePayload
    > = Outcome.Either<S, F>

    export type FunctionDetails = {
      name: string
      sourceTree: TreeNamespace.Tree
    }

    export type Function<
      Main extends Tree.RestingValue, // [WIP] Should never expect Transformers here...
      Args extends Tree.Value[], // [WIP] probably neither here
      Out extends Tree.RestingValue
    > = (mainValue: Main, args: Args, details: FunctionDetails) => Output<Out, FailurePayload>
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
    export type PrimitiveValue = null | boolean | number | string | Text | NodeListOf<Element | Text> | Element | MethodValue
    export type RestingValue = PrimitiveValue | RestingValue[] | { [k: string]: RestingValue }
    export type Value = RestingValue | TransformerValue
    export type ArrayValue = RestingValue[]
    export type RecordValue = { [k: string]: RestingValue }

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
      Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
      Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
      Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
    > = {
      defaultMode: Types.Tree.Mode
      isolationInitType: Exclude<Types.Tree.ValueTypeName, 'transformer' | 'method'>
      generator: (innerValue: Types.Tree.RestingValue, mode: Types.Tree.Mode, sourceTree: TreeNamespace.Tree) => {
        transformer: Transformer<Main, Args, Output>,
        method: Method<Main, Args, Output>
      }
    }

    export type Descriptor<
      Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
      Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
      Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
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
