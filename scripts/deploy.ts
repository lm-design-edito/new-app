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
  * Getting current GIT Status
  * * * * * * * * ** * * * * * * * * * * * */
  const gitStatus = await new Promise(resolve => exec(
    `git status`,
    (err, stdout, stderr) => {
      if (err !== null || stderr !== '') {
        const errorMessage = 'Something went wrong while getting git status'
          + `\nerr: ${err}`
          + `\nstderr: ${stderr}`
          + `\nstdout: ${stdout}`
        console.log(styles.error(errorMessage))
        console.log('')
        console.log(styles.important('Deployment aborted.'))
        console.log('')
        return process.exit(1)
      }
      resolve(stdout)
    }
  ))
  console.log(styles.title('Git status'))
  console.log(styles.regular(gitStatus as string))
  const gitStatusSeemsClean = typeof gitStatus === 'string' && gitStatus.match(/nothing\sto\scommit/igm) !== null
  const gitBranchSeemsMaster = typeof gitStatus === 'string' && gitStatus.match(/On branch master/igm) !== null
  let branchOk = gitBranchSeemsMaster
  let statusOk = false
  let statusReallyOk = false
  let readyToBeFired = false
  if (!gitBranchSeemsMaster) {
    const promptsResponse = await prompts({
      name: 'branckOk',
      type: 'confirm',
      message: `\n${styles.danger(
        'You are not in the master branch.\n\n'
        + 'The files you are trying to deploy\n'
        + 'may be overwritten by future deployments.\n'
        + 'Are you really sure you want to deploy anyway?'
      )}`
    })
    branchOk = promptsResponse.branckOk
    if (branchOk !== true) {
      console.log('')
      console.log(styles.important('Deployment aborted.'))
      return process.exit(0)
    }
    console.log('')
  }
  if (gitStatusSeemsClean) {
    const promptsResponse = await prompts({
      name: 'statusOk',
      type: 'confirm',
      message: 'Git status seems ok?'
    })
    statusOk = promptsResponse.statusOk
    if (statusOk !== true) {
      console.log('')
      console.log(styles.important('Deployment aborted.'))
      return process.exit(0)
    }
    console.log('')
  } else {
    const promptsResponse = await prompts({
      name: 'statusOk',
      type: 'confirm',
      message: `\n${styles.danger(
        `You are about to deploy uncommited\n`
        + `changes and you probably shouldn't.\n\n`
        + `Are you perfectly sure?`.toUpperCase()
      )}`
    })
    statusOk = promptsResponse.statusOk
    if (statusOk !== true) {
      console.log('')
      console.log(styles.important('Deployment aborted.'))
      return process.exit(0)
    }
    console.log('')
    const promptsResponse2 = await prompts({
      name: 'statusReallyOk',
      type: 'confirm',
      message: `\n${styles.danger('YOU SHOULD NOT DO THIS.\n\nFinal word?')}`
    })
    statusReallyOk = promptsResponse2.statusReallyOk
    if (statusReallyOk !== true) {
      console.log('')
      console.log(styles.important('Deployment aborted.'))
      return process.exit(0)
    }
    console.log('')
    if (!gitBranchSeemsMaster) {
      const promptsResponse3 = await prompts({
        name: 'readyToBeFired',
        type: 'confirm',
        message: `\n${styles.danger(`No commits, not in master...\n\nWell actually if you see this,\nyou're about to be fired.\n\nLet's go?`)}`
      })
      readyToBeFired = promptsResponse3.readyToBeFired
      if (readyToBeFired !== true) {
        console.log(styles.important('Thank you. Deployment aborted.'))
        return process.exit(0)
      }
    }
    console.log('')
  }
  const latestCommitNumber = await new Promise((resolve) => {
    exec('git log', (err, stdout) => {
      if (err !== null) {
        console.log(styles.error(err.message))
        console.log(styles.error('\nExiting now.\n'))
        process.exit(1)
      }
      const commitNumber = stdout.match(/^\s*commit\s[0-9a-f]+\s/)
        ?.[0].replace(/^\s*commit\s/, '')
        .trim()
      resolve(commitNumber)
    })
  }) as string|undefined
  if (latestCommitNumber === undefined) {
    console.error(styles.error(`Could not find the latest commit number, something is not right here.\n`))
    console.error(styles.error(`\nExiting now.\n`))
    process.exit(1)
  }

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
    V0 = 'gs://decodeurs/design-edito/v0'
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
  const VERSIONS_JSON_DIR = join(config.TEMP, `${Date.now()}-${randomUUID()}`)
  await fs.mkdir(VERSIONS_JSON_DIR, { recursive: true })
  let versionsJsonExists = false
  let currentVersionArr: [number, number, number, number] = [0, 0, 0, 0]
  await new Promise(resolve => exec(
    `gsutil cp ${targetDestinationName}/versions.json ${VERSIONS_JSON_DIR}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  if (!versionsJsonExists) {
    console.warn(styles.important(`versions.json seems to be missing in ${targetDestinationName}\n`))
    const { continueWithoutVersionsJson } = await prompts({
      name: 'continueWithoutVersionsJson',
      type: 'confirm',
      message: 'Continue ?'
    })
    if (continueWithoutVersionsJson !== true) {
      console.log('')
      console.log(styles.error('Exiting now.\n'))
      process.exit(0)
    }
    console.log('')
  }

  let versionsJsonStr: string|null = null
  let versionsJsonParsed: unknown
  let versionsObj: { [key: string]: any } = {}
  if (versionsJsonExists) {
    const VERSIONS_JSON = join(VERSIONS_JSON_DIR, 'versions.json')
    try {
      versionsJsonStr = await fs.readFile(VERSIONS_JSON, { encoding: 'utf-8' })
      versionsJsonParsed = JSON.parse(versionsJsonStr)
      Object.keys(versionsJsonParsed as any).forEach(versionNumber => {
        const versionData = (versionsJsonParsed as any)[versionNumber]
        versionsObj[versionNumber] = versionData
      })
    } catch (err) {
      console.error(styles.error(`Something went wrong while parsing ${VERSIONS_JSON}. Contents:\n\n${versionsJsonStr}\n`))
      console.log(styles.error('Exiting now.\n'))
      process.exit(1)
    }
    const versionsList = Object.keys(versionsObj)
    const versionArrs = versionsList.map(nbr => nbr.split('.').map(nbr => parseInt(nbr)))
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
  }
  const versionsDataExists = currentVersionArr.some(num => num !== 0)
  if (versionsDataExists) console.log(styles.regular(`Latest version found: ${currentVersionArr.join('.')}\n`))

 /* * * * * * * * * * * * * * * * * * * * *
  * Selecting target version
  * * * * * * * * ** * * * * * * * * * * * */
  const newVersionNumberOptions = (() => {
    const [major, minor, patch, build] = currentVersionArr
    return {
      build: [major, minor, patch, build + 1] as [number, number, number, number],
      patch: [major, minor, patch + 1, 0] as [number, number, number, number],
      minor: [major, minor + 1, 0, 0] as [number, number, number, number],
      major: [major + 1, 0, 0, 0] as [number, number, number, number]
    }
  })()
  console.log(styles.title('Select the target version'))
  let versionUpgradeType:'build'|'patch'|'minor'|'major'|'custom'|null = null
  let targetVersionArr: [number, number, number, number] = [...currentVersionArr]
  // If previous versions detected, ask for upgrade type
  if (versionsDataExists) {
    const { upgradeType } = await prompts({
      name: 'upgradeType',
      message: 'Target version',
      type: 'select',
      choices: [
        { title: `New build (${newVersionNumberOptions.build.join('.')})`, value: 'build' },
        { title: `New patch (${newVersionNumberOptions.patch.join('.')})`, value: 'patch' },
        { title: `New minor (${newVersionNumberOptions.minor.join('.')})`, value: 'minor' },
        { title: `New major (${newVersionNumberOptions.major.join('.')})`, value: 'major' },
        { title: 'Custom version number', value: 'custom' }
      ]
    })
    versionUpgradeType = upgradeType
    if (versionUpgradeType === 'build') targetVersionArr = [...newVersionNumberOptions.build]
    else if (versionUpgradeType === 'patch') targetVersionArr = [...newVersionNumberOptions.patch]
    else if (versionUpgradeType === 'minor') targetVersionArr = [...newVersionNumberOptions.minor]
    else if (versionUpgradeType === 'major') targetVersionArr = [...newVersionNumberOptions.major]
  }
  // If no previous versions detected
  if (!versionsDataExists) console.log(styles.regular('No previous version detected in this target destination, you will have to manually choose the target version number:\n'))
  // If no previous versions or custom number choosed  
  if (!versionsDataExists
    || versionUpgradeType === 'custom'
    || versionUpgradeType === null) {
    const {
      customMajor,
      customMinor,
      customPatch,
      customBuild
    } = await prompts([{
      name: 'customMajor',
      message: 'major:',
      type: 'number'
    }, {
      name: 'customMinor',
      message: 'minor:',
      type: 'number'
    }, {
      name: 'customPatch',
      message: 'patch:',
      type: 'number'
    }, {
      name: 'customBuild',
      message: 'build:',
      type: 'number'
    }])
    targetVersionArr = [customMajor, customMinor, customPatch, customBuild]
  }
  
  console.log(styles.important(`\nTarget version: ${targetVersionArr.join('.')}\n`))
  if (versionsDataExists && targetVersionArr[0] !== currentVersionArr[0]) {
    const message = `It seems that you want to deploy a build for major version ${targetVersionArr[0]}\n`
                  + `in a target that contains builds for major version ${currentVersionArr[0]}\n\n`
                  + `You may want to change the target destination in order to avoid\n`
                  + `deploying breaking changes to projects that are already live.`
    console.log(styles.danger(message))
    console.log('')
    const { continueWithMixedVersionsInTarget } = await prompts({
      name: 'continueWithMixedVersionsInTarget',
      type: 'confirm',
      message: 'Continue anyway? (Definitely NOT recommended)'
    })
    console.log('')
    if (continueWithMixedVersionsInTarget !== true) {
      console.log(styles.error('Exiting now.\n'))
      process.exit(0)
    }
  }

  const { versionDescription } = await prompts({
    type: 'text',
    name: 'versionDescription',
    message: 'Description for this version:'
  })
 
  /* * * * * * * * * * * * * * * * * * * * *
  * Write version related stuff
  * * * * * * * * ** * * * * * * * * * * * */
  const thisVersionJsonData = {
    description: (versionDescription ?? '') as string,
    build: Date.now(),
    commit: gitStatusSeemsClean
      ? latestCommitNumber
      : `${latestCommitNumber} (with uncommited changes)`
  }
  const newVersionsJsonObj = {
    ...versionsObj,
    [targetVersionArr.join('.')]: thisVersionJsonData
  }
  await fs.writeFile(
    join(config.DST_PROD, 'versions.json'),
    JSON.stringify(newVersionsJsonObj, null, 2),
    { encoding: 'utf-8' }
  )
  const DST_PROD_SHARED_INDEX = join(config.DST_PROD, 'shared', 'index.js')
  const dstProdSharedContent = await fs.readFile(DST_PROD_SHARED_INDEX, { encoding: 'utf-8' })
  await fs.writeFile(DST_PROD_SHARED_INDEX, `/* v.${targetVersionArr.join('.')} */ ${dstProdSharedContent}`)
  const DST_PROD_SHARED_INDEX_VERSIONNED = join(config.DST_PROD, 'shared', `index.v${targetVersionArr.join('.')}.js`)
  await fs.copyFile(DST_PROD_SHARED_INDEX, DST_PROD_SHARED_INDEX_VERSIONNED)
  console.log('')

 /* * * * * * * * * * * * * * * * * * * * *
  * Check dist/prod tree
  * * * * * * * * ** * * * * * * * * * * * */
  const distTree = await tree({
    base: config.DST_PROD,
    noreport: true,
    l: 500
  })
  console.log(styles.title('Local contents of dist/prod/'))
  console.log(styles.regular(distTree.report))
  const { distTreeOk } = await prompts({
    name: 'distTreeOk',
    type: 'confirm',
    message: 'dist/prod/ tree seems ok?'
  })
  if (distTreeOk !== true) {
    console.log(styles.error('\nExiting now.\n'))
    return process.exit(0)
  }
  console.log('')
  
 /* * * * * * * * * * * * * * * * * * * * *
  * Rsync dry run
  * * * * * * * * ** * * * * * * * * * * * */
  console.log(styles.title(`Dry running rsync to ${targetDestinationName}`))
  await new Promise(resolve => exec(
    `gsutil -m rsync -nrpj html,js,map,css,svg,png,jpg,gif,woff,woff2,eot,ttf ${config.DST_PROD}/ ${targetDestinationName}/`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  const { dryRunSeemsOk1 } = await prompts({
    name: 'dryRunSeemsOk1',
    type: 'confirm',
    message: `\n${styles.danger(`All good, ready to deploy to:\n${targetDestinationName}\n\nAfter this message, files get actually deployed.\n\nLet's go?`)}`
  })
  if (dryRunSeemsOk1 !== true) {
    console.log(styles.error('\nExiting now.\n'))
    return process.exit(0)
  }
  console.log('')

 /* * * * * * * * * * * * * * * * * * * * *
  * Actual Rsync
  * * * * * * * * ** * * * * * * * * * * * */
  console.log(styles.title(`Rsyncing to ${targetDestinationName}`))
  await new Promise(resolve => exec(
    `gsutil -m rsync -rpj html,js,map,css,svg,png,jpg,gif,woff,woff2,eot,ttf ${config.DST_PROD}/ ${targetDestinationName}/`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  await new Promise(resolve => exec(
    `gsutil cp ${join(config.DST_PROD, 'versions.json')} ${targetDestinationName}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  console.log('')

  /* * * * * * * * * * * * * * * * * * * * *
  * Making files public
  * * * * * * * * ** * * * * * * * * * * * */
  console.log(styles.title(`Making files public`))
  await new Promise(resolve => exec(
    `gsutil -m acl -r ch -u allUsers:R ${targetDestinationName}`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  console.log('')

  /* * * * * * * * * * * * * * * * * * * * *
  * Setting cache to 60s
  * * * * * * * * ** * * * * * * * * * * * */
  console.log(styles.title(`Setting cache to 60s`))
  await new Promise(resolve => exec(
    `gsutil -m setmeta -rh "Cache-Control:public, max-age=60" ${targetDestinationName}`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  console.log('')


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
