import { Generators as GeneratorsNamespace } from '../generators'
import { Tree as TreeNamespace } from '../tree'

export namespace Types {

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * GENERATORS
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export namespace Generators {
    export type TransformationSuccess<S extends Tree.Value> = { success: true, value: S }
    export type TransformationFailure<F extends Tree.Value> = { success: false, value: F }
    export type TransformationOutput<S extends Tree.Value, F extends Tree.Value> = TransformationSuccess<S> | TransformationFailure<F>
    export type TransformerFunction<
      In extends Tree.Value,
      Args extends Tree.Value[],
      Out extends Tree.Value,
      Err extends Tree.Value
    > = (input: In, args: Args, details: {
      name: string
      sourceTree: TreeNamespace.Tree
    }) => TransformationOutput<Out, Err>

    export type TransformerOptions = Pick<
      SmartTags.Options<
        Tree.ValueTypeName[],
        Tree.ValueTypeName[]
      >,
      'inputTypes' | 'outputTypes'
    >
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
  
    export type ValueTypesIndex = {
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

    export type ValueTypeName = keyof ValueTypesIndex
    export type ValueType<K extends ValueTypeName[]> = ValueTypesIndex[K[number]]

    export const anyType = ['null', 'boolean', 'number', 'string', 'element', 'text', 'nodelist', 'transformer', 'method', 'array', 'record', 'any'] as Array<keyof ValueTypesIndex>
  }

  /* * * * * * * * * * * * * * * * * * * * * * 
   *
   * SMART TAGS
   * 
   * * * * * * * * * * * * * * * * * * * * * */
  export namespace SmartTags {
    
    export type Options<
      In extends Tree.ValueTypeName[],
      Out extends Tree.ValueTypeName[]
    > = {
      initializer?: (sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      wrapper?: (coalescedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      inputTypes?: In
      outputTypes?: Out
    }
    
    export type Descriptor<
      In extends Tree.ValueTypeName[],
      Out extends Tree.ValueTypeName[]
    > = [
      name: string,
      options?: Options<In, Out>,
      func?: Types.Generators.TransformerFunction<
        Tree.ValueType<In>,
        Tree.Value[],
        Tree.ValueType<Out>,
        Tree.Value
      > | undefined
    ]
  
    export type Data = {
      name: string
      initializer?: (sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      wrapper?: (coalescedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => Types.Tree.Value
      generator?: (wrappedValue: Types.Tree.Value, sourceTree: TreeNamespace.Tree) => {
        transformer: GeneratorsNamespace.Transformer
        method: GeneratorsNamespace.Method
      }
    }

    export type Register = Map<Data['name'], Data>
  }
}
