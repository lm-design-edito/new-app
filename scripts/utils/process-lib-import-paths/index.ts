import { promises as fs } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import * as config from '../../config.js'
import listAllTsFiles from '../list-ts-files/index.js'

export default async function processLibImportPaths () {
  const srcTsconfigData = await fs.readFile(config.SRC_TSCONFIG, { encoding: 'utf-8' })
  const srcTsconfig = JSON.parse(srcTsconfigData)
  const pathAliases = [...new Map<string, string>(Object
    .entries(srcTsconfig?.compilerOptions?.paths ?? {})
    .map<[string, string]>(([alias, aliasedPath]) => [
      alias.split('*')[0] ?? '',
      `${aliasedPath}`.split('*')[0] ?? ''
    ])
    .map(([alias, aliasedPath]) => [alias, path.join(config.SRC, aliasedPath)])
  ).entries()]

  const allTsFiles = Object.values(await listAllTsFiles(config.LIB, '/'))
  await Promise.all(allTsFiles.map(async filePath => {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf-8' })
    const fileName =  path.basename(filePath)
    const fileSource = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true)
    const allFileImports: string[] = []
    function visit (node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        let moduleSpecifier = node.moduleSpecifier.getText()
        moduleSpecifier = moduleSpecifier
          .slice(1, moduleSpecifier.length - 1)
        allFileImports.push(moduleSpecifier.trim())
      }
      ts.forEachChild(node, visit)
    }
    visit(fileSource)
    const importReplacements = new Map<string, string>()
    allFileImports.forEach(importPath => {
      pathAliases.some(([alias, aliasedPath]) => {
        if (!importPath.startsWith(alias)) return false
        const aliasedPathRelFromSrc = path.relative(config.SRC, aliasedPath)
        const aliasedPathAbsInLib = path.join(config.LIB, aliasedPathRelFromSrc)
        const aliasedPathRelFromFile = path.relative(path.dirname(filePath), aliasedPathAbsInLib)
        const importPathWithoutAlias = importPath.replace(alias, '')
        const importPathReplaced = path.join(aliasedPathRelFromFile, importPathWithoutAlias)
        importReplacements.set(importPath, importPathReplaced)
      })
    })
    let fileReplacedContent: string = fileContent
    importReplacements.forEach((replacement, toReplace) => {
      fileReplacedContent = fileReplacedContent.replaceAll(toReplace, replacement)
    })
    if (importReplacements.size > 0) await fs.writeFile(filePath, fileReplacedContent, { encoding: 'utf8' })
  }))
}
