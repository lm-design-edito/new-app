import { Cast as CastNamespace } from './cast'
import { SmartTags as SmartTagsNamespace } from './smart-tags'
import { Tree as TreeNamespace } from './tree'
import { Types as TypesNamespace } from './types'
import { Utils as UtilsNamespace } from './utils'

export namespace HyperJson {
  export import Cast = CastNamespace
  export import SmartTags = SmartTagsNamespace
  export import Tree = TreeNamespace
  export import Types = TypesNamespace
  export import Utils = UtilsNamespace
}
