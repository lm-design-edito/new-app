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
    export type TransformationSuccess<S extends Tree.Value = Tree.Value> = Outcome.Success<S>
    export type TransformationFailure<F extends Tree.Value = Tree.Value> = Outcome.Failure<F>
    export type TransformationOutput<
      S extends Tree.Value = Tree.Value,
      F extends Tree.Value = Tree.Value
    > = Outcome.Either<S, F>
    export type TransformerFunctionDetails = { name: string, sourceTree: TreeNamespace.Tree }
    export type TransformerFunction<
      S extends Tree.Value = Tree.Value,
      F extends Tree.Value = Tree.Value
    > = (input: Tree.Value, args: Tree.Value[], details: TransformerFunctionDetails) => TransformationOutput<S, F>
    export type TransformerTypedFunction<
      In extends Tree.Value = Tree.Value,
      Args extends Tree.ArrayValue = Tree.ArrayValue,
      Out extends Tree.Value = Tree.Value,
      Err extends Tree.Value = Tree.Value
    > = (input: In, args: Args, details: TransformerFunctionDetails) => TransformationOutput<Out, Err>
    export type TransformerOptions<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Out extends Tree.Value
    > = {
      inputCheck: (input: unknown) => Outcome.Either<In, Tree.Value>,
      argsCheck: (args: unknown[]) => Outcome.Either<Args, Tree.Value>,
      outputCheck: (output: unknown) => Outcome.Either<Out, Tree.Value>
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
    export type PrimitiveValue = NullValue | BooleanValue | NumberValue | StringValue | ElementValue | TextValue | NodeListValue | TransformerValue | MethodValue
    export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
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
      Out extends Tree.Value
    > = Generators.TransformerOptions<In, Args, Out> & {
      initializer: (sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      wrapper: (coalescedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => Types.Tree.Value,
    }
    
    export type Descriptor<
      In extends Tree.Value,
      Args extends Tree.ArrayValue,
      Out extends Tree.Value
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
