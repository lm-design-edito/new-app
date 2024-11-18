import { Transformer } from '../transformer'
import { Types } from '../types'

export class Method<
  Main extends Types.Tree.Value = Types.Tree.Value,
  Args extends Types.Tree.ArrayValue = Types.Tree.ArrayValue,
  Output extends Types.Methods.TransformationSuccessPayload = Types.Methods.TransformationSuccessPayload
> {
  transformer: Transformer<Main, Args, Output>

  static clone <
    Main extends Types.Tree.Value,
    Args extends Types.Tree.ArrayValue,
    Output extends Types.Methods.TransformationSuccessPayload
  >(method: Method<Main, Args, Output>): Method<Main, Args, Output> {
    const { transformer } = method
    return new Method(transformer)
  }

  constructor (transformer: Transformer<Main, Args, Output>) {
    this.transformer = transformer
  }
}
