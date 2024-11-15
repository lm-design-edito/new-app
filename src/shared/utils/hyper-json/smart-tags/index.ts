import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Tree as TreeNamespace } from '../tree'
import { Types } from '../types'

export namespace SmartTags {
  export type SmartTag<
    Main extends Types.Tree.Value = Types.Tree.Value,
    Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
    Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
  > = {
    defaultMode: Types.Tree.Mode
    init: (mode: Types.Tree.Mode) => Types.Tree.ValueTypeName
    generator: (innerValue: Types.Tree.Value, mode: Types.Tree.Mode, sourceTree: TreeNamespace.Tree) => {
      transformer: Types.Methods.TEMP_Transformer<Main, Args, Output>,
      method: Types.Methods.TEMP_Method<Main, Args, Output>
    }
  }

  type Descriptor<
    Main extends Types.Tree.Value = Types.Tree.Value,
    Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
    Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
  > = {
    name: string,
    defaultMode: Types.Tree.Mode,
    init: (mode: Types.Tree.Mode) => Types.Tree.ValueTypeName,
    mainValueCheck: Types.Methods.TEMP_Transformer<Main, Args, Output>['typeChecks']['mainValue'],
    argsValueCheck: Types.Methods.TEMP_Transformer<Main, Args, Output>['typeChecks']['argsValue'],
    func: Types.Methods.TEMP_Transformer<Main, Args, Output>['func']
  }

  function makeSmartTag <
    Main extends Types.Tree.Value = Types.Tree.Value,
    Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
    Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
  >(descriptor: Descriptor<Main, Args, Output>): [string, SmartTag<Main, Args, Output>] {
    return [descriptor.name, {
      defaultMode: descriptor.defaultMode,
      init: descriptor.init,
      generator: (innerValue, mode, sourceTree) => {
        const transformer = new Types.Methods.TEMP_Transformer<Main, Args, Output>(
          descriptor.name,
          mode,
          innerValue, {
            mainValue: descriptor.mainValueCheck,
            argsValue: descriptor.argsValueCheck
          },
          descriptor.func,
          sourceTree
        )
        const method = new Types.Methods.TEMP_Method(transformer)
        return { transformer, method }
      }
    }]
    return 0 as any
  }

  export type Register = Map<string, SmartTag<any, any, any>>
  
  export const register: Register = new Map([
    ['hyperjson', {
      defaultMode: 'isolation',
      init: () => 'record',
      generator: (innerValue, mode, sourceTree) => {
        const transformer = new Types.Methods.TEMP_Transformer<number, number[], number>('hyperjson', mode, innerValue, {
          mainValue: (main) => typeof main === 'number'
            ? Outcome.makeSuccess(main)
            : Outcome.makeFailure({ expected: 'number', found: 'something else' }),
          argsValue: (args) => args.every(entry => typeof entry === 'number')
            ? Outcome.makeSuccess(args)
            : Outcome.makeFailure({ expected: 'number[]', found: 'something else' })
        }, () => Outcome.makeSuccess(3), sourceTree)
        const method = new Types.Methods.TEMP_Method(transformer)
        return { transformer, method }
      }
    }]
  ])
}
