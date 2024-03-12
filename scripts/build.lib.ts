import rmLib from './utils/rm-lib/index.js'
import makeLib from './utils/make-lib/index.js'
import bundleLibApp from './utils/bundle-lib-app/index.js'
import generateLibTypes from './utils/generate-lib-types/index.js'
import processLibImportPaths from './utils/process-lib-import-paths/index.js'

await rmLib()
await makeLib()

await build()

export default async function build () {
  await generateLibTypes()
  await processLibImportPaths()
  await bundleLibApp()
}
