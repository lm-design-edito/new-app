import rmLib from './utils/rm-lib/index.js'
import mkLib from './utils/mk-lib/index.js'
import bundleLibApp from './utils/bundle-app-for-lib/index.js'
import generateLibTypes from './utils/generate-lib-types/index.js'
import processLibImportPaths from './utils/process-lib-import-paths/index.js'
import writePkgJsonInLib from './utils/write-package-json-in-lib/index.js'
import writeMainFileInLib from './utils/write-main-file-in-lib/index.js'
import writeReadmeFileInLib from './utils/write-readme-file-in-lib/index.js'
import incrementVersion from './utils/increment-version/index.js'

await rmLib()
await mkLib()
await build()

export default async function build () {
  incrementVersion('1.6.3-alpha.12346') // 
  // await generateLibTypes()
  // await processLibImportPaths()
  // await bundleLibApp()
  // await writePkgJsonInLib()
  // await writeMainFileInLib()
  // await writeReadmeFileInLib()
}
