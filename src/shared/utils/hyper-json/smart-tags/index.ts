import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../cast'
import { Generators } from '../generators'
import { Types } from '../types'
import { Utils } from '../utils'

export namespace SmartTags {
  export const wrongInput = (found: string, expected: string) => Outcome.makeFailure(`Input (${found}) does not match its types constraints: ${expected}`)
  export const wrongArgument = (pos: number, found: string, expected: string) => Outcome.makeFailure(`Argument at pos ${pos} (${found}) does not match its types constraints: ${expected}`)
  export const wrongOutput = (found: string, expected: string) => Outcome.makeFailure(`IMPLEMENTATION ERROR: output (${found}) does not match its types constraints: ${expected}`)

  export function fillOptions <
    In extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Out extends Types.Tree.Value
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

  export function descriptorToNamedData <
    In extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Out extends Types.Tree.Value
  >(descriptor: Types.SmartTags.Descriptor<In, Args, Out>): [string, Types.SmartTags.Data] {
    const [name, partialOptions, func] = descriptor
    const options = fillOptions(partialOptions)
    return [name, {
      name,
      initializer: options.initializer,
      wrapper: options.wrapper,
      generator: Generators.make(name, func, options)
    }]
  }

  export const defaultRegister: Types.SmartTags.Register = new Map([
    descriptorToNamedData(['lol', {}, (i) => Outcome.makeSuccess(i)]),
    descriptorToNamedData(['lol', {
      inputCheck: (i): Outcome.Success<number> => Outcome.makeSuccess(i as number)
    }, (i) => Outcome.makeSuccess(i)])
  ])

  // export function makeData<
  //   In extends Types.Tree.ValueTypeName[],
  //   Out extends Types.Tree.ValueTypeName[]
  // > (descriptor: Types.SmartTags.Descriptor<In, Out>): Types.SmartTags.Data {
  //   const [name, options, func] = descriptor
  //   return {
  //     name,
  //     initializer: options?.initializer,
  //     wrapper: options?.wrapper,
  //     generator: Generators.make(name, func)
  //   }
  // }

  // export function makeSmartTagsMap<
  //   In extends Types.Tree.ValueTypeName[],
  //   Out extends Types.Tree.ValueTypeName[]
  // > (descriptors: Types.SmartTags.Descriptor<In, Out>[]): Types.SmartTags.Register {
  //   return new Map(descriptors.map(desc => [desc[0], makeData(desc)] as const))
  // }
  
  // export const defaultRegister = makeSmartTagsMap([
  //   ['hyperjson', {
  //     initializer: () => ({}),
  //     wrapper: Cast.toRecord
  //   }],

  //   ['text', {
  //     initializer: sourceTree => {
  //       const { document } = Window.get()
  //       return document.createTextNode(sourceTree.node.textContent ?? '')
  //     },
  //     wrapper: Cast.toText
  //   }],

  //   ['string', {
  //     initializer: () => '',
  //     wrapper: Cast.toString
  //   }]
  // ])
}
