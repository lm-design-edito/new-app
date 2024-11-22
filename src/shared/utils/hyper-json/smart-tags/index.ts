import { Method } from '../method'
import { Transformer } from '../transformer'
import { Types } from '../types'

export namespace SmartTags {
  export function makeSmartTag <
    Main extends Types.Tree.RestingValue = Types.Tree.RestingValue,
    Args extends Types.Tree.RestingArrayValue = Types.Tree.RestingArrayValue,
    Output extends Types.Tree.RestingValue = Types.Tree.RestingValue
  >(descriptor: Types.SmartTags.Descriptor<Main, Args, Output>): [string, Types.SmartTags.SmartTag<Main, Args, Output>] {
    return [descriptor.name, {
      defaultMode: descriptor.defaultMode,
      isolationInitType: descriptor.isolationInitType,
      generator: (innerValue, mode, sourceTree) => {
        const transformer = new Transformer<Main, Args, Output>(
          descriptor.name,
          mode,
          innerValue, {
            mainValue: descriptor.mainValueCheck,
            argsValue: descriptor.argsValueCheck
          },
          descriptor.func,
          sourceTree
        )
        const method = new Method(transformer)
        return { transformer, method }
      }
    }]
  }
}
