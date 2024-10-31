import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../cast'
import { Generators } from '../generators'
import { Types } from '../types'

const appendFunc: Types.Generators.TransformerFunction<
  number | string,
  Types.Tree.Value[],
  number | string,
  string
> = (input, args, details) => {
  return {
    success: true,
    value: 'Should have appended heheheh'
  }
}

export namespace SmartTags {
  export function makeData<
    In extends Types.Tree.ValueTypeName[],
    Out extends Types.Tree.ValueTypeName[]
  > (descriptor: Types.SmartTags.Descriptor<
    In,
    Out
  >): Types.SmartTags.Data {
    const [name, options, func] = descriptor
    return {
      name,
      initializer: options?.initializer,
      wrapper: options?.wrapper,
      generator: Generators.make(name, func, {
        inputTypes: options?.inputTypes,
        outputTypes: options?.outputTypes
      })
    }
  }

  export function makeSmartTagsMap<
    In extends Types.Tree.ValueTypeName[],
    Out extends Types.Tree.ValueTypeName[]
  > (descriptors: Types.SmartTags.Descriptor<In, Out>[]): Types.SmartTags.Register {
    return new Map(descriptors.map(desc => [desc[0], makeData(desc)] as const))
  }
  
  export const defaultSmartTagsData = makeSmartTagsMap([
    ['hyperjson', {
      initializer: () => ({}),
      wrapper: Cast.toRecord
    }],

    ['text', {
      initializer: sourceTree => {
        const { document } = Window.get()
        return document.createTextNode(sourceTree.node.textContent ?? '')
      },
      wrapper: Cast.toText
    }],

    ['string', {
      initializer: () => '',
      wrapper: Cast.toString
    }],

    ['append', {
      inputTypes: ['number', 'string'],
      outputTypes: ['number', 'string']
    }, appendFunc]
  ])
}
