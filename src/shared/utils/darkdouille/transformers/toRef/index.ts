import { Darkdouille } from '../..'
import toString from '../toString'

let paths: string[] = []

const toRef = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator => () => {
  const returned: Darkdouille.Transformer = (inputValue) => {
    console.group('toRef')
    const strValue = toString()(inputValue).trim()
    const resolved = resolve(strValue)
    console.log('from', resolve('.'))
    console.log('input', inputValue)
    console.log('strValue', strValue)
    console.log('resolved', resolved)
    
    /* Circular reference pattern detection */
    const thisPath = resolve('.')?.path
    const resolvedPath = resolved?.path
    if (resolved === undefined
      || thisPath === undefined
      || resolvedPath === undefined) {
      paths = []
      console.groupEnd()
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
      console.groupEnd()
      return undefined
    }
    
    /* Possibly dive deep further */
    const value = resolved?.value
    paths = []
    console.groupEnd()
    return value
  }
  return returned
}

export default toRef
