import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { recordMap } from '@design-edito/tools/agnostic/objects/record-map'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Generators } from '../generators'
import { Types } from '../types'
import { Tree } from '../tree'

export namespace Utils {
  export function clone<T extends Types.Tree.Value = Types.Tree.Value> (value: T): T {
    const { Element, Text, NodeList, document } = Window.get()
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null) return value
    if (Array.isArray(value)) return [...value.map(clone)] as T
    if (value instanceof Element) return value.cloneNode(true) as T
    if (value instanceof Text) return value.cloneNode(true) as T
    if (value instanceof Generators.Transformer) return Generators.Transformer.clone(value) as T
    if (value instanceof Generators.Method) return Generators.Method.clone(value) as T
    if (value instanceof NodeList) {
      const frag = document.createDocumentFragment()
      const nodes = Array.from(value).map(e => e.cloneNode(true) as Element | Text)
      frag.append(...nodes)
      return frag.childNodes as T
    }
    if (isRecord(value)) return recordMap(value, prop => clone(prop as Types.Tree.Value)) as T
    throw new Error(`Unexpected value input: ${value}`)
  }

  export function reduceValues (
    currentValue: Types.Tree.Value,
    subpath: string | number,
    rawsubvalue: Types.Tree.Value,
    sourceTree: Tree.Tree): Types.Tree.Value {    
    const { Element, Text, NodeList, document } = Window.get()

    let subvalue = rawsubvalue

    // If subvalue is a Transformer, apply it
    if (subvalue instanceof Generators.Transformer) {
      const transformer = subvalue
      const mode = transformer.mode
      if (mode === 'isolation') {
        const transformationResult = transformer.apply()
        if (!transformationResult.success) return currentValue
        else {
          const evaluated = transformationResult.payload

          // [WIP] What if payload is a transformer itself ?
          // thought of this below but meh...

          // if (evaluated instanceof Generators.Transformer) {
          //   const msg = `A transformer must not return a transformer value. At: ${sourceTree.pathString}`
          //   throw new Error(msg)
          // }
          subvalue = evaluated
        }
      } else {
        const transformationResult = transformer.apply(currentValue)
        if (transformationResult.success === false) return currentValue
        else return transformationResult.payload
      }
    }

    if (Array.isArray(currentValue)) return [...currentValue, subvalue]
    if (currentValue === null) return subvalue
    if (typeof currentValue === 'boolean') return subvalue
    if (typeof currentValue === 'number') return subvalue
    if (currentValue instanceof Generators.Transformer) return subvalue
    if (currentValue instanceof Generators.Method) return subvalue
    
    if (typeof currentValue === 'string') {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) return `${currentValue}${subvalue}`
      if (subvalue instanceof Text) return `${currentValue}${subvalue.textContent}`
      if (subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, Utils.clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(currentValue, ...Utils.clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof Text) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) return document.createTextNode(`${currentValue.textContent}${subvalue}`)
      if (subvalue instanceof Text) return document.createTextNode(`${currentValue.textContent}${subvalue.textContent}`)
      if (subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof Element) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), `${subvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof Text || subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
  
    if (currentValue instanceof NodeList) {
      if (subvalue === null
        || typeof subvalue === 'boolean'
        || typeof subvalue === 'number'
        || typeof subvalue === 'string'
      ) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), `${subvalue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof Text || subvalue instanceof Element) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (subvalue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(...clone(currentValue), ...clone(subvalue))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      return subvalue
    }
    
    // current value is a record here
    if (typeof subpath === 'number') return { ...currentValue }
    return {
      ...currentValue,
      [subpath]: subvalue
    }
  }

  // [WIP] typechecks should be in its own util lib ?
  function singleTypeCheck<K extends Types.Tree.ValueTypeName> (
    value: unknown,
    type: K
  ): value is Types.Tree.ValueTypeNamesIndex[K] {
    const { Element, Text, NodeList } = Window.get()
    if (type === 'any' && getType(value) !== undefined) return true
    if (type === 'null' && value === null) return true
    if (type === 'boolean' && typeof value === 'boolean') return true
    if (type === 'number' && typeof value === 'number') return true
    if (type === 'string' && typeof value === 'string') return true
    if (type === 'element' && value instanceof Element) return true
    if (type === 'text' && value instanceof Text) return true
    if (type === 'nodelist' && value instanceof NodeList) return true
    if (type === 'transformer' && value instanceof Generators.Transformer) return true
    if (type === 'method' && value instanceof Generators.Method) return true
    if (type === 'array' && Array.isArray(value)) return true
    if (type === 'record' && isRecord(value)) return true
    return false
  }

  export function getType<T extends unknown> (
    value: T
  ): T extends Types.Tree.Value
    ? Types.Tree.ValueTypeName
    : Types.Tree.ValueTypeName | undefined {
    if (value === null) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (value instanceof Element) return 'element'
    if (value instanceof Text) return 'text'
    if (value instanceof NodeList) return 'nodelist'
    if (value instanceof Generators.Transformer) return 'transformer'
    if (value instanceof Generators.Method) return 'method'
    if (Array.isArray(value)) return 'array'
    if (isRecord(value)) return 'record'
    return undefined as T extends Types.Tree.Value
      ? Types.Tree.ValueTypeName
      : Types.Tree.ValueTypeName | undefined
  }

  export function typeCheck<K extends Array<Types.Tree.ValueTypeName>> (
    value: unknown,
    ...types: K
  ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>, { expected: string, found: string }> {
    const matchesOneType = types.some(type => singleTypeCheck(value, type))
    if (matchesOneType) return Outcome.makeSuccess(value as Types.Tree.ValueTypeFromNames<K>)
    return Outcome.makeFailure({
      expected: types.join(' | '),
      found: getType(value) ?? '<undefined>'
    })
  }

  export function typeCheckMany<K extends Array<Types.Tree.ValueTypeName>> (
    values: unknown[],
    ...types: K
  ): Outcome.Either<Types.Tree.ValueTypeFromNames<K>[], { position: number, expected: string, found: string }> {
    for (const [pos, val] of Object.entries(values)) {
      const checked = typeCheck(val, ...types)
      if (checked.success) continue
      return Outcome.makeFailure({ position: parseInt(pos), ...checked.error })
    }
    return Outcome.makeSuccess(values as Types.Tree.ValueTypeFromNames<K>[])
  }

  export namespace SmartTags {
    function fillOptions <
      In extends Types.Tree.Value,
      Args extends Types.Tree.ArrayValue,
      Out extends Types.Tree.DELETE_ME_StaticValue
    >(partial: Partial<Types.SmartTags.Options<In, Args, Out>>): Types.SmartTags.Options<In, Args, Out> {
      return {
        initializer: () => [],
        wrapper: i => i,
        inputCheck: (input: unknown) => Outcome.makeSuccess(input as In),
        argsCheck: (args: unknown[]) => Outcome.makeSuccess(args as Args),
        outputCheck: (output: unknown) => Outcome.makeSuccess(output as Out),
        ...partial
      }
    }

    export function makeData <
      In extends Types.Tree.Value,
      Args extends Types.Tree.ArrayValue,
      Out extends Types.Tree.DELETE_ME_StaticValue
    >(...descriptor: Types.SmartTags.Descriptor<In, Args, Out>): [string, Types.SmartTags.Data] {
      const [name, partialOptions, func] = descriptor
      const options = fillOptions<In, Args, Out>(partialOptions)
      return [name, {
        name,
        initializer: options.initializer,
        wrapper: options.wrapper,
        generator: Generators.make(name, func, options)
      }]
    }

    type InputCheckFail = Types.Generators.TransformerInputCheckerFailure
    type ArgsCheckFail = Types.Generators.TransformerArgsCheckerFailure
    type OutputCheckFail = Types.Generators.TransformerOutputCheckerFailure

    export function makeInputCheckFailure (details: InputCheckFail): Outcome.Failure<InputCheckFail> { return Outcome.makeFailure(details) }
    export function makeArgsCheckFailure (details: ArgsCheckFail): Outcome.Failure<ArgsCheckFail> { return Outcome.makeFailure(details) }
    export function makeOutputCheckFailure (details: OutputCheckFail): Outcome.Failure<OutputCheckFail> { return Outcome.makeFailure(details) }
    export function makeTypeCheckFailure (
      type: 'input',
      expected?: Types.Generators.TransformerTypeCheckFailureExpected,
      found?: Types.Generators.TransformerTypeCheckFailureFound,
      details?: Types.Generators.TransformerTypeCheckFailureDetails,
    ): Outcome.Failure<InputCheckFail>
    export function makeTypeCheckFailure (
      type: 'args',
      expected?: Types.Generators.TransformerTypeCheckFailureExpected,
      found?: Types.Generators.TransformerTypeCheckFailureFound,
      details?: Types.Generators.TransformerTypeCheckFailureDetails,
      position?: Types.Generators.TransformerTypeCheckFailurePosition
    ): Outcome.Failure<ArgsCheckFail>
    export function makeTypeCheckFailure (
      type: 'output',
      expected?: Types.Generators.TransformerTypeCheckFailureExpected,
      found?: Types.Generators.TransformerTypeCheckFailureFound,
      details?: Types.Generators.TransformerTypeCheckFailureDetails,
    ): Outcome.Failure<OutputCheckFail>
    export function makeTypeCheckFailure (
      type: 'input' | 'args' | 'output',
      expected: Types.Generators.TransformerTypeCheckFailureExpected | undefined = undefined,
      found: Types.Generators.TransformerTypeCheckFailureFound | undefined = undefined,
      details: Types.Generators.TransformerTypeCheckFailureDetails | undefined = undefined,
      position: Types.Generators.TransformerTypeCheckFailurePosition | undefined = undefined
    ): Outcome.Failure<InputCheckFail | ArgsCheckFail | OutputCheckFail> {
      if (type === 'input' || type === 'output') return Outcome.makeFailure({
        expected,
        found,
        details
      })
      return Outcome.makeFailure({
        expected,
        found,
        details,
        position
      })
    }

    export const expectEmptyArgs: Types.Generators.TransformerArgsChecker<Types.Tree.Value, []> = args => {
      if (args.length !== 0) return Utils.SmartTags.makeTypeCheckFailure('args', undefined, undefined, 'No arguments are expected.')
      return Outcome.makeSuccess([])
    }
  }
}
