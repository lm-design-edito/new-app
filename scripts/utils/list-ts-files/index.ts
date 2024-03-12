import { promises as fs } from 'node:fs'
import path from 'node:path'

export default async function listAllTsFiles (sourceDir: string, relativeTo: string = sourceDir): Promise<{ [key: string]: string }> {
  const files = await fs.readdir(sourceDir, { withFileTypes: true })
  const paths = await Promise.all(
    files.map(async file => {
      const absPath = path.resolve(sourceDir, file.name)
      const relPath = path.relative(relativeTo, absPath)
      if (file.isDirectory()) return listAllTsFiles(absPath, relativeTo)
      else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const fileName = relPath
          .replace(/\\/g, '/')
          .replace(/\.tsx?$/, '')
        return { [fileName]: absPath }
      }
    }).filter((elt): elt is Promise<{ [key: string]: string }> => {
      return elt !== undefined
    })
  )
  return paths.reduce((reduced, pathsObj) => ({
    ...reduced,
    ...pathsObj
  }), {})
}
