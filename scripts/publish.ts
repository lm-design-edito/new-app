import { exec } from 'node:child_process'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import tree from 'tree-cli'
import chalk from 'chalk'
import prompts from 'prompts'
import { glob } from 'glob'
import * as config from './config.js'
import { randomUUID } from 'node:crypto'

main ()

async function main () {
 /* * * * * * * * * * * * * * * * * * * * *
  * Remove all .DS_Store and unwanted files
  * * * * * * * * ** * * * * * * * * * * * */
  const dsStores = await glob(join(config.DST_PROD, '**/.DS_Store'))
  await Promise.all(dsStores.map(dsStore => fs.rm(dsStore)))
  console.log(styles.title('Deleting .DS_Store files in dist/prod'))
  if (dsStores.length > 0) dsStores.forEach(dsStore => console.log(styles.regular(`deleted: ${dsStore}`)))
  else console.log(styles.regular('No .DS_Store file found'))
  console.log('')

 /* * * * * * * * * * * * * * * * * * * * *
  * Select target destination
  * * * * * * * * ** * * * * * * * * * * * */
  enum Targets {
    V001 = 'gs://decodeurs/design-edito/v0.0.1',
    V0 = 'gs://decodeurs/design-edito/v0',
    V1 = 'gs://decodeurs/design-edito/v1'
  }
  console.log(styles.title('Select a target destination'))
  const { targetDestinationName } = await prompts({
    name: 'targetDestinationName',
    type: 'select',
    message: 'destination',
    choices: Object.entries(Targets).map(([_key, value]) => ({ title: value, value }))
  })
  console.log('')

 /* * * * * * * * * * * * * * * * * * * * *
  * Retrieving versionning info
  * * * * * * * * ** * * * * * * * * * * * */
  console.log(styles.title(`Retrieving versionning info from ${targetDestinationName}/versions.json`))
  const VERSIONS_JSON_DIR = join(config.TEMP, randomUUID())
  await fs.mkdir(VERSIONS_JSON_DIR, { recursive: true })
  let versionsFileWritten = false
  let currentVersionArr = [0, 0, 0, 0]
  await new Promise(resolve => exec(
    `gsutil cp ${targetDestinationName}/versions.json ${VERSIONS_JSON_DIR}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.light(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsFileWritten = true
      resolve(true)
    }
  ))
  if (!versionsFileWritten) {
    console.warn(styles.important(`versions.json seems to be missing in ${targetDestinationName}\n`))
    const { continueWithoutVersionsJson } = await prompts({
      name: 'continueWithoutVersionsJson',
      type: 'confirm',
      message: 'Continue ?'
    })
    if (continueWithoutVersionsJson !== true) {
      console.log('')
      console.log(styles.error('Exiting now.\n'))
      await fs.rm(VERSIONS_JSON_DIR, { recursive: true, force: true })
      process.exit(0)
    }
  }

  let versionsObj: { [key: string]: any } = {}
  if (versionsFileWritten) {
    try {
      const versionsDataStr = await fs.readFile(join(VERSIONS_JSON_DIR, 'versions.json'), { encoding: 'utf-8' })
      const versionsDataObj = JSON.parse(versionsDataStr) as unknown
      const versionNumbers = Object.keys(versionsDataObj as any)
      versionNumbers.forEach(versionNumber => {
        versionsObj[versionNumber] = (versionsDataObj as any)[versionNumber]
      })
      const versionArrs = versionNumbers.map(nbr => nbr.split('.').map(nbr => parseInt(nbr)))
      const highestMajor = Math.max(...versionArrs.map(versionArr => versionArr[0] ?? -1))
      const majorVersions = versionArrs.filter(versionArr => versionArr[0] === highestMajor)
      const highestMinor = Math.max(...majorVersions.map(versionArr => versionArr[1] ?? -1))
      const minorVersions = majorVersions.filter(versionArr => versionArr[1] === highestMinor)
      const highestPatch = Math.max(...minorVersions.map(versionArr => versionArr[2] ?? -1))
      const patchVersions = minorVersions.filter(versionArr => versionArr[2] === highestPatch)
      const highestBuild = Math.max(...patchVersions.map(versionArr => versionArr[3] ?? -1))
      const build = patchVersions.filter(versionArr => versionArr[3] === highestBuild)[0] as number[]|undefined
      currentVersionArr[0] = build?.[0] ?? 0
      currentVersionArr[1] = build?.[1] ?? 0
      currentVersionArr[2] = build?.[2] ?? 0
      currentVersionArr[3] = build?.[3] ?? 0
    } catch (err) {
      // [WIP] finish this
      console.log(err)
    }
  }

  await fs.rm(VERSIONS_JSON_DIR, { recursive: true, force: true })
  
  // await new Promise((resolve, reject) => exec(
  //   `gsutil -m rsync -nrpj html,js,map,css,svg,png,jpg,gif,woff,woff2,eot,ttf ${targetDestinationName} ${config.PUBLISHED}/`,
  //   (err, stdout, stderr) => {
  //     console.log('ERR')
  //     console.log(err)
  //     console.log('\nSTDOUT')
  //     console.log(stdout)
  //     console.log('\nSTDERR')
  //     console.log(stderr)
  //   })
  // )

//   /* * * * * * * * * * * * * * * * * * * * *
//   * Check dist/prod tree
//   * * * * * * * * ** * * * * * * * * * * * */
//   const distTree = await tree({
//     base: config.DST_PROD,
//     noreport: true,
//     l: 500
//   })
//   console.log(styles.title('Contents of dist/prod/'))
//   console.log(styles.regular(distTree.report))
//   const { distTreeOk } = await prompts({
//     name: 'distTreeOk',
//     type: 'confirm',
//     message: 'dist/prod/ tree seems ok?'
//   })
//   if (distTreeOk !== true) {
//     console.log(styles.important('Publication aborted.'))
//     return process.exit(0)
//   }
//   console.log('')
  
//   /* * * * * * * * * * * * * * * * * * * * *
//   * Check published tree
//   * * * * * * * * ** * * * * * * * * * * * */
//  // [WIP] published should be retreived from gg cloud ?
//   const publishedTree = await tree({
//     base: config.PUBLISHED,
//     noreport: true,
//     l: 500
//   })
//   console.log(styles.title('Contents of published/'))
//   console.log(styles.regular(publishedTree.report))
//   const { pubTreeok } = await prompts({
//     name: 'pubTreeok',
//     type: 'confirm',
//     message: 'published/ tree seems ok?'
//   })
//   if (pubTreeok !== true) {
//     console.log(styles.important('Publication aborted.'))
//     return process.exit(0)
//   }
//   console.log('')

//   /* * * * * * * * * * * * * * * * * * * * *
//   * Check diff
//   * * * * * * * * ** * * * * * * * * * * * */
//   const diff = await new Promise((resolve, reject) => exec(
//     `diff -bur ${config.DST_PROD} ${config.PUBLISHED}`,
//     (err, stdout, stderr) => {
//       if (stderr !== '') {
//         const errorMessage = 'Something went wrong while diffing dist/prod/ and published/'
//           + `\nerr: ${err}`
//           + `\nstderr: ${stderr}`
//           + `\nstdout: ${stdout}`
//         console.log(styles.error(errorMessage))
//         console.log(styles.important('Publication aborted.'))
//         return process.exit(0)
//       }
//       resolve(stdout)
//     }
//   ))
//   console.log(styles.title('Diff'))
//   console.log(styles.regular(diff as string))
//   const { diffOk } = await prompts({
//     name: 'diffOk',
//     type: 'confirm',
//     message: 'Diff between dist/prod/ and published/ seems ok?'
//   })
//   if (diffOk !== true) {
//     console.log(styles.important('Publication aborted.'))
//     return process.exit(0)
//   }
//   console.log('')

//   /* * * * * * * * * * * * * * * * * * * * *
//   * Getting current GIT Status
//   * * * * * * * * ** * * * * * * * * * * * */
//   const gitStatus = await new Promise(resolve => exec(
//     `git status`,
//     (err, stdout, stderr) => {
//       if (err !== null || stderr !== '') {
//         const errorMessage = 'Something went wrong while getting git status'
//           + `\nerr: ${err}`
//           + `\nstderr: ${stderr}`
//           + `\nstdout: ${stdout}`
//         console.log(styles.error(errorMessage))
//         console.log(styles.important('Publication aborted.'))
//         return process.exit(0)
//       }
//       resolve(stdout)
//     }
//   ))
//   console.log(styles.title('Git status'))
//   console.log(styles.regular(gitStatus as string))
//   const gitStatusSeemsClean = typeof gitStatus === 'string' && gitStatus.match(/nothing\sto\scommit/igm) !== null
//   const gitBranchSeemsMaster = typeof gitStatus === 'string' && gitStatus.match(/On branch master/igm) !== null
//   let branchOk = gitBranchSeemsMaster
//   let statusOk = false
//   let statusReallyOk = false
//   let readyToBeFired = false
//   if (!gitBranchSeemsMaster) {
//     const promptsResponse = await prompts({
//       name: 'branckOk',
//       type: 'confirm',
//       message: `\n${styles.danger(
//         'You are not in the master branch.\n\n'
//         + 'The files you are trying to publish\n'
//         + 'may be overwritten by future publications.\n'
//         + 'Are you really sure you want to publish anyway?'
//       )}`
//     })
//     branchOk = promptsResponse.branckOk
//     if (branchOk !== true) {
//       console.log(styles.important('Publication aborted.'))
//       return process.exit(0)
//     }
//     console.log('')
//   }
//   if (gitStatusSeemsClean) {
//     const promptsResponse = await prompts({
//       name: 'statusOk',
//       type: 'confirm',
//       message: 'Git status seems ok?'
//     })
//     statusOk = promptsResponse.statusOk
//     if (statusOk !== true) {
//       console.log(styles.important('Publication aborted.'))
//       return process.exit(0)
//     }
//     console.log('')
//   } else {
//     const promptsResponse = await prompts({
//       name: 'statusOk',
//       type: 'confirm',
//       message: `\n${styles.danger(
//         `You are about to publish uncommited\n`
//         + `changes and you probably shouldn't.\n\n`
//         + `Are you perfectly sure?`.toUpperCase()
//       )}`
//     })
//     statusOk = promptsResponse.statusOk
//     if (statusOk !== true) {
//       console.log(styles.important('Publication aborted.'))
//       return process.exit(0)
//     }
//     console.log('')
//     const promptsResponse2 = await prompts({
//       name: 'statusReallyOk',
//       type: 'confirm',
//       message: `\n${styles.danger('YOU SHOULD NOT DO THIS.\n\nFinal word?')}`
//     })
//     statusReallyOk = promptsResponse2.statusReallyOk
//     if (statusReallyOk !== true) {
//       console.log(styles.important('Publication aborted.'))
//       return process.exit(0)
//     }
//     console.log('')
//     if (!gitBranchSeemsMaster) {
//       const promptsResponse3 = await prompts({
//         name: 'readyToBeFired',
//         type: 'confirm',
//         message: `\n${styles.danger(`No commits, not in master...\n\nWell actually if you see this,\nyou're about to be fired.\n\nLet's go?`)}`
//       })
//       readyToBeFired = promptsResponse3.readyToBeFired
//       if (readyToBeFired !== true) {
//         console.log(styles.important('Thank you. Publication aborted.'))
//         return process.exit(0)
//       }
//     }
//     console.log('')
//   }

//   /* * * * * * * * * * * * * * * * * * * * *
//   * Rsyncing
//   * * * * * * * * ** * * * * * * * * * * * */
//  // [WIP] Upload to ggcloud
//   const { rsyncOk } = await prompts({
//     name: 'rsyncOk',
//     type: 'confirm',
//     message: `\n${styles.danger('Ready to rsync dist/prod/ to published/ ?')}`
//   })
//   if (rsyncOk !== true) {
//     console.log(styles.important('Publication aborted.'))
//     return process.exit(0)
//   }
//   console.log('')
//   console.log(styles.title('Rsyncing...'))
//   console.log(styles.important('That\'s all good my friend.'))
}

function makeTextBlock (text: string, vPadding: number = 1, hPadding: number = vPadding) {
  const lines = text.split('\n')
  const longestLine = Math.max(...lines.map(line => line.length))
  const textBlockArr = new Array(lines.length + 2 * vPadding)
    .fill(null)
    .map(() => new Array(longestLine + (hPadding * 2)).fill(' '))
  lines.forEach((line, linePos) => {
    const chars = line.split('')
    textBlockArr[linePos + vPadding].splice(hPadding, chars.length, ...chars)
  })
  return textBlockArr
  .map(lineArr => lineArr.join(''))
  .join('\n')
}

const styles = {
  regular: (text: string) => text,
  light: (text: string) => chalk.grey(text),
  danger: (text: string) => chalk.bold.bgRed.whiteBright(makeTextBlock(`/!\\\n\n${text}\n`, 2, 6)),
  important: (text: string) => chalk.bold(text),
  title: (text: string) => `# ${chalk.bold.underline(`${text}\n`)}`,
  info: (text: string) => chalk.blueBright(text),
  error: (text: string) => chalk.red(text),
  warning: (text: string) => chalk.yellow(text)
}
