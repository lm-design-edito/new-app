import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree as TreeNamespace } from '../tree'
import { Transformer } from '../transformer'
import { Method } from '../method'

export namespace Types {
  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * TRANSFORMATIONS
   * 
   * * * * * * * * * * * * * * * * * * * * * */
  
  export namespace Transformations {
    export type FunctionMainValueFailure = {
      expected: string
      found: string
      details?: any
    }

    export type FunctionArgsValueFailure = {
      expected: string
      found: string
      position?: number
      details?: any
    }

    export type FunctionTransformationFailure = {
      details?: any
    }

    export type FunctionFailurePayload = FunctionMainValueFailure
      | FunctionArgsValueFailure
      | FunctionTransformationFailure

    export type FunctionDetailsArg = {
      name: string
      sourceTree: TreeNamespace.Tree
    }

    export type Function<
      Main extends Tree.RestingValue,
      Args extends Tree.Value[],
      Out extends Tree.RestingValue
    > = (mainValue: Main, args: Args, details: FunctionDetailsArg) => Outcome.Either<Out, FunctionFailurePayload>

    export type FailurePayloadCore = {
      transformerName: string
      path: string
      mainValue: Tree.RestingValue
      argsValue: Tree.RestingArrayValue
    }

    export type MainValueFailurePayload = FailurePayloadCore & FunctionMainValueFailure & { message: 'BAD_MAIN_VALUE' }
    export type ArgsValueFailurePayload = FailurePayloadCore & FunctionArgsValueFailure & { message: 'BAD_ARGUMENTS_VALUE' }
    export type TransformationFailurePayload = FailurePayloadCore & FunctionTransformationFailure & { message: 'TRANSFORMATION_ERROR' }

    export type FailurePayload = MainValueFailurePayload | ArgsValueFailurePayload | TransformationFailurePayload

    export type Output<
      S extends Tree.RestingValue = Tree.RestingValue,
      F extends FailurePayload = FailurePayload
    > = Outcome.Either<S, F>
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
    export type RestingArrayValue = RestingValue[]
    export type RestingRecordValue = { [k: string]: RestingValue }

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
      array: RestingArrayValue
      record: RestingRecordValue
    }

    export type ValueTypeName = keyof ValuesTypesNamesIndex
    export type ValueTypeFromNames<N extends ValueTypeName[]> = ValuesTypesNamesIndex[N[number]]

    export type Resolver = (path: TreeNamespace.Tree['path']) => TreeNamespace.Tree | undefined

    export type Options = {
      globalObject: RestingRecordValue
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * SMART TAGS
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace SmartTags {
    export type SmartTag<
      Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
      Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
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
      Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
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
