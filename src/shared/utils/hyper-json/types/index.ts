import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Generators as GeneratorsNamespace } from '../generators'
import { Tree as TreeNamespace } from '../tree'

export namespace Types {

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * GENERATORS
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace Generators {
    export type Generator = (
      wrapped: Types.Tree.Value,
      sourceTree: TreeNamespace.Tree
    ) => {
      transformer: GeneratorsNamespace.Transformer,
      method: GeneratorsNamespace.Method
    }
    export type TransformationSuccess<S extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue> = Outcome.Success<S>
    export type TransformationFailure<F extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue> = Outcome.Failure<F>
    export type TransformationOutput<
      S extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue,
      F extends Tree.Value = Tree.Value
    > = Outcome.Either<S, F>
    export type TransformerFunctionDetails = { name: string, sourceTree: TreeNamespace.Tree }
    export type TransformerFunction<
      S extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue,
      F extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue
    > = (input: Tree.Value, args: Tree.Value[], details: TransformerFunctionDetails) => TransformationOutput<S, F>
    export type TransformerTypedFunction<
      In extends Tree.Value = Tree.Value,
      Args extends Tree.ArrayValue = Tree.ArrayValue,
      Out extends Tree.DELETE_ME_StaticValue = Tree.DELETE_ME_StaticValue,
      Err extends Tree.Value = Tree.Value
    > = (input: In, args: Args, details: TransformerFunctionDetails) => TransformationOutput<Out, Err>
    export type TransformerTypeCheckFailureExpected = string
    export type TransformerTypeCheckFailureFound = string
    export type TransformerTypeCheckFailureDetails = Tree.Value
    export type TransformerTypeCheckFailurePosition = number
    export type TransformerInputCheckerFailure = {
      expected?: TransformerTypeCheckFailureExpected
      found?: TransformerTypeCheckFailureFound
      details?: TransformerTypeCheckFailureDetails
    }
    export type TransformerInputChecker<In extends Tree.Value> = (input: unknown) => Outcome.Either<In, TransformerInputCheckerFailure>
    export type TransformerArgsCheckerFailure = {
      position?: TransformerTypeCheckFailurePosition
      expected?: TransformerTypeCheckFailureExpected
      found?: TransformerTypeCheckFailureFound
      details?: TransformerTypeCheckFailureDetails
    }
    export type TransformerArgsChecker<
      In extends Tree.Value,
      Args extends Tree.ArrayValue
    > = (args: unknown[], input: In) => Outcome.Either<Args, TransformerArgsCheckerFailure>
    export type TransformerOutputCheckerFailure = {
      expected?: TransformerTypeCheckFailureExpected
      found?: TransformerTypeCheckFailureFound
      details?: TransformerTypeCheckFailureDetails
    }
    export type TransformerOutputChecker<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Output extends Tree.DELETE_ME_StaticValue> = (output: unknown, input: In, args: Args) => Outcome.Either<Output, TransformerOutputCheckerFailure>
    export type TransformerOptions<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Out extends Tree.DELETE_ME_StaticValue
    > = {
      inputCheck: TransformerInputChecker<In>
      argsCheck: TransformerArgsChecker<In, Args>
      outputCheck: TransformerOutputChecker<In, Args, Out>
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * MERGE
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace Merge {
    export type Options = {
      actionAttribute: string
      keyAttribute: string
    }

    export enum Action {
      APPEND = 'append',
      PREPEND = 'prepend',
      REPLACE = 'replace'
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * TREE
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace Tree {
    export type Options = Types.Merge.Options & {
      globalObj: { [k: string]: Value }
      smartTags: SmartTags.Register
      modeAttribute: string
    }
  
    export type NullValue = null
    export type BooleanValue = boolean
    export type NumberValue = number
    export type StringValue = string
    export type ElementValue = Element
    export type TextValue = Text
    export type NodeListValue = NodeListOf<ElementValue | TextValue>
    export type TransformerValue = GeneratorsNamespace.Transformer
    export type MethodValue = GeneratorsNamespace.Method
    // export type StaticPrimitiveValue = NullValue | BooleanValue | NumberValue | StringValue | ElementValue | TextValue | NodeListValue
    // export type StaticValue = StaticPrimitiveValue | StaticValue[] | { [k: string]: StaticValue }
    // export type StaticArrayValue = StaticValue[]
    // export type StaticRecordValue = { [k: string]: StaticValue }
    // export type PrimitiveValue = StaticPrimitiveValue | TransformerValue | MethodValue
    export type PrimitiveValue = NullValue | BooleanValue | NumberValue | StringValue | ElementValue | TextValue | NodeListValue | TransformerValue | MethodValue
    export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
    export type DELETE_ME_StaticValue = Value // [WIP] replace everywhere with StaticValue
    export type ArrayValue = Value[]
    export type RecordValue = { [k: string]: Value }
  
    export type ValueTypeNamesIndex = {
      null: NullValue
      boolean: BooleanValue
      number: NumberValue
      string: StringValue
      element: ElementValue
      text: TextValue
      nodelist: NodeListValue
      transformer: TransformerValue
      method: MethodValue
      array: ArrayValue
      record: RecordValue
      any: Value
    }

    export type ValueTypeName = keyof ValueTypeNamesIndex
    export type ValueTypeFromNames<K extends ValueTypeName[]> = ValueTypeNamesIndex[K[number]]
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * SMART TAGS
   * 
   * * * * * * * * * * * * * * * * * * * * * */
  export namespace SmartTags {
    
    export type Options<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Out extends Tree.DELETE_ME_StaticValue
    > = Generators.TransformerOptions<In, Args, Out> & {
      initializer: (sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      wrapper: (coalescedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => Types.Tree.Value,
    }
    
    export type Descriptor<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Out extends Tree.DELETE_ME_StaticValue
    > = [
      name: string,
      options: Partial<Options<In, Args, Out>>,
      func: Types.Generators.TransformerTypedFunction<In, Args, Out>
    ]
  
    export type Data = {
      name: string
      initializer: (sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      wrapper: (coalescedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      generator: (wrappedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => {
        transformer: GeneratorsNamespace.Transformer
        method: GeneratorsNamespace.Method
      }
    }

    export type Register = Map<Data['name'], Data>
  }
}
