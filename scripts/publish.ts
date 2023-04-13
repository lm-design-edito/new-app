import tree from 'tree-cli'
import prompts from 'prompts'
import { exec } from 'node:child_process'
import * as config from './config.js'

main ()

async function main () {
  // Check dist/prod tree
  const distTree = await tree({
    base: config.DST_PROD,
    noreport: true,
    l: 500
  })
  console.log(distTree.report)
  const { distTreeOk } = await prompts({
    name: 'distTreeOk',
    type: 'confirm',
    message: 'dist/prod/ tree seems ok ?'
  })
  if (distTreeOk !== true) {
    console.log('Publication aborted.')
    process.exit(0)
  }
  console.log('')
  
  // Check published tree
  const publishedTree = await tree({
    base: config.PUBLISHED,
    noreport: true,
    l: 500
  })
  console.log(publishedTree.report)
  const { pubTreeok } = await prompts({
    name: 'pubTreeok',
    type: 'confirm',
    message: 'published/ tree seems ok ?'
  })
  if (pubTreeok !== true) {
    console.log('Publication aborted.')
    process.exit(0)
  }
  console.log('')

  // Check diff
  const diff = await new Promise((resolve, reject) => exec(
    `diff -bur ${config.DST_PROD} ${config.PUBLISHED}`,
    (_err, stdout, stderr) => {
      if (stderr) {
        console.log('Something went wrong while diffing dist/prod/ and published/')
        console.log(stderr)
        console.log(stdout)
        console.log('Publication aborted.')
        return process.exit(0)
      }
      resolve(stdout)
    }
  ))
  console.log(diff)
  const { diffOk } = await prompts({
    name: 'diffOk',
    type: 'confirm',
    message: 'Diff between dist/prod/ and published/ seems ok ?'
  })
  if (diffOk !== true) {
    console.log('Publication aborted.')
    process.exit(0)
  }
  console.log('')

  // Getting current GIT Status
  // console.log(publishedTree)
}
