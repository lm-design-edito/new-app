import { Tree } from '../tree'

export namespace Types {
  export enum TyperTagName {
    ANY = 'any',
    NULL = 'null',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    STRING = 'string',
    TEXT = 'text',
    NODELIST = 'nodelist',
    ARRAY = 'array',
    RECORD = 'record',
    LITERAL = 'literal',
    REF = 'ref',
    FUNCTION = 'function'
  }
  
  export type PrimitiveValue = null | string | number | boolean | Element | Text | NodeListOf<Text | Element> | Transformer
  export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
  export type TransformerHooks = {
    resolver: Tree.Tree['resolve']
    getGenerator: Tree.Tree['getGenerator']
  }
  export type TransformerErrorReturnType = { action: 'ERROR', value: Value }
  // export type TransformerReplaceReturnType = { action: 'REPLACE', value: Exclude<Value, Transformer> }
  export type TransformerReplaceReturnType = { action: 'REPLACE', value: Value }
  export type TransformerNullReturnType = { action: null }
  export type TransformerReturnType = TransformerErrorReturnType
    | TransformerReplaceReturnType
    | TransformerNullReturnType

  export type AnonymousTransformer = (currentValue: Value, callerTree: Tree.Tree) => TransformerReturnType
  export type Transformer = AnonymousTransformer & {
    transformerName: string
    args: Value[]
  }
  export type TransformerGenerator = (name: string, ...args: Value[]) => Transformer
  export type Resolver = (path: Tree.Tree['path']) => Tree.Tree | undefined

  export type TreeOptions = {
    generatorsMap: Map<string, Types.TransformerGenerator>
    keyAttribute: string
    actionAttribute: string
    globalObj: { [k: string]: Value }
  }

  export enum ReductionAction {
    APPEND = 'append',
    PREPEND = 'prepend',
    REPLACE = 'replace'
  }

  export type Serialized = { type: 'null', value: null }
    | { type: 'boolean', value: boolean }
    | { type: 'number', value: number }
    | { type: 'string', value: string }
    | { type: 'text', value: string }
    | { type: 'element', value: string }
    | { type: 'nodelist', value: Array<Serialized> }
    | { type: 'array', value: Array<Serialized> }
    | { type: 'record', value: { [k: string]: Serialized } }
    | { type: 'transformer', value: Transformer }
}
