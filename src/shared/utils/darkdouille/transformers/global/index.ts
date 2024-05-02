import { Globals } from '~/shared/globals'
import { Darkdouille } from '../..'
const global: Darkdouille.TransformerFunctionGenerator = () => {
  return () => {
    const safeGlobalObj = { ...Globals.globalObj, tree: undefined }
    return Darkdouille.toTreeValue(safeGlobalObj)
  }
}

export default global
