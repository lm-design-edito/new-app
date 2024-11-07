import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Generators } from '../generators'
import { Types } from '../types'

export namespace SmartTags {
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

  export function makeData <
    In extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Out extends Types.Tree.Value
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

  export const defaultRegister: Types.SmartTags.Register = new Map([])
}
