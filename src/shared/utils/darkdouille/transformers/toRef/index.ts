import { Darkdouille } from '../..'
import toString from '../toString'

let intermediatePaths: string[] = []

const toRef = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator => () => {
  const returned: Darkdouille.Transformer = (inputValue) => {
    const strValue = toString()(inputValue).trim()
    const resolvedInput = resolve(strValue)
    /* Circular reference pattern detection */
    const thisPath = resolve('.')?.path
    const resolvedPath = resolvedInput?.path
    if (resolvedInput === undefined
      || thisPath === undefined
      || resolvedPath === undefined) {
      intermediatePaths = []
      return undefined
    }
    intermediatePaths.push(thisPath)
    const circularPattern = intermediatePaths.some(intermediatePath => {
      const intermediatePathChunks = intermediatePath.split('/')
      const resolvedPathChunks = resolvedPath.split('/')
      const resolvedIsParent = resolvedPathChunks.every((pathChunk, pathChunkPos) => intermediatePathChunks[pathChunkPos] === pathChunk)
      const resolvedIsChild = intermediatePathChunks.every((pathChunk, pathChunkPos) => resolvedPathChunks[pathChunkPos] === pathChunk)
      return resolvedIsParent || resolvedIsChild
    })
    if (circularPattern) {
      console.error(
        'Circular reference pattern detected:\n >',
        [...intermediatePaths, resolvedPath].join('\n > ')
      )
      intermediatePaths = []
      return undefined
    }
    /* Possibly dive deep further */
    const value = resolvedInput?.value
    intermediatePaths = []
    return value
  }
  return returned
}

export default toRef
