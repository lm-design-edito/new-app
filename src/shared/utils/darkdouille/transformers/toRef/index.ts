import { Darkdouille } from '../..'
import toString from '../toString'

let paths: string[] = []

const toRef = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator => () => {
  return (inputValue) => {
    const strValue = toString()(inputValue)
    const resolved = resolve(strValue)
    
    /* Circular reference pattern detection */
    const thisPath = resolve('.')?.path
    const resolvedPath = resolved?.path
    if (resolved === undefined
      || thisPath === undefined
      || resolvedPath === undefined) {
      paths = []
      return undefined
    }
    paths.push(thisPath)
    const circularPattern = paths.some(path => {
      const resolvedIsParent = path.startsWith(resolvedPath)
      const resolvedIsChild = resolvedPath.startsWith(path)
      return resolvedIsParent || resolvedIsChild
    })
    if (circularPattern) {
      console.error('Circular reference pattern detected:\n >', [...paths, resolvedPath].join('\n > '))
      paths = []
      return undefined
    }
    
    /* Possibly dive deep further */
    const value = resolved?.value
    paths = []
    return value
  }
}

export default toRef
