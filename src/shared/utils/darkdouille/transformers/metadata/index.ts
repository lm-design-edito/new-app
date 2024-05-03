import { Globals } from '~/shared/globals'
import isRecord from '~/utils/is-record'
import { Darkdouille } from '../..'
import recordMap from '~/utils/record-map'
import { Externals } from '~/shared/externals'

const metadata: Darkdouille.TransformerFunctionGenerator = () => {
  return () => {
    const meta = (Globals.globalObj.meta ?? {}) as Partial<NonNullable<typeof Globals['globalObj']['meta']>>
    const paths = (Globals.globalObj.meta ?? {}).paths ?? {} as NonNullable<typeof meta.paths>
    const strPaths = recordMap(paths, (val, key, rec) => val.toString())
    return toTreeValue({
      ...meta,
      paths: strPaths,
      platform: Externals.getPlatform(),
      edition: Externals.getEdition(),
      window: { location: window.location }
    })
  }
}

function toTreeValue (input: unknown): Darkdouille.TreeValue {
  if (input === undefined) return undefined
    if (input === null) return null
    if (typeof input === 'string') return input
    if (typeof input === 'number') return input
    if (typeof input === 'boolean') return input
    if (input instanceof NodeList) return input as NodeListOf<Node>
    if (Array.isArray(input)) return input.map(toTreeValue)
    if (isRecord(input)) {
      const keys = Object.keys(input)
      return keys.reduce((reduced, key) => {
        const treeVal = toTreeValue(input[key])
        if (treeVal === undefined) return { ...reduced }
        return { ...reduced, [key]: treeVal }
      }, {} as Darkdouille.TreeRecordValue)
    }
    return undefined
}

export default metadata
