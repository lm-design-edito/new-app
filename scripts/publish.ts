import tree from 'tree-cli'
import chalk from 'chalk'
import prompts from 'prompts'
import { exec } from 'node:child_process'
import * as config from './config.js'

main ()

async function main () {
  /* * * * * * * * * * * * * * * * * * * * *
  * Remove all .DS_Store and unwanted files
  * * * * * * * * ** * * * * * * * * * * * */
 // [WIP] Do this

  /* * * * * * * * * * * * * * * * * * * * *
  * Check dist/prod tree
  * * * * * * * * ** * * * * * * * * * * * */
  const distTree = await tree({
    base: config.DST_PROD,
    noreport: true,
    l: 500
  })
  console.log(styles.title('Contents of dist/prod/'))
  console.log(styles.regular(distTree.report))
  const { distTreeOk } = await prompts({
    name: 'distTreeOk',
    type: 'confirm',
    message: 'dist/prod/ tree seems ok?'
  })
  if (distTreeOk !== true) {
    console.log(styles.important('Publication aborted.'))
    return process.exit(0)
  }
  console.log('')
  
  /* * * * * * * * * * * * * * * * * * * * *
  * Check published tree
  * * * * * * * * ** * * * * * * * * * * * */
 // [WIP] published should be retreived from gg cloud ?
  const publishedTree = await tree({
    base: config.PUBLISHED,
    noreport: true,
    l: 500
  })
  console.log(styles.title('Contents of published/'))
  console.log(styles.regular(publishedTree.report))
  const { pubTreeok } = await prompts({
    name: 'pubTreeok',
    type: 'confirm',
    message: 'published/ tree seems ok?'
  })
  if (pubTreeok !== true) {
    console.log(styles.important('Publication aborted.'))
    return process.exit(0)
  }
  console.log('')

  /* * * * * * * * * * * * * * * * * * * * *
  * Check diff
  * * * * * * * * ** * * * * * * * * * * * */
  const diff = await new Promise((resolve, reject) => exec(
    `diff -bur ${config.DST_PROD} ${config.PUBLISHED}`,
    (err, stdout, stderr) => {
      if (stderr !== '') {
        const errorMessage = 'Something went wrong while diffing dist/prod/ and published/'
          + `\nerr: ${err}`
          + `\nstderr: ${stderr}`
          + `\nstdout: ${stdout}`
        console.log(styles.error(errorMessage))
        console.log(styles.important('Publication aborted.'))
        return process.exit(0)
      }
      resolve(stdout)
    }
  ))
  console.log(styles.title('Diff'))
  console.log(styles.regular(diff as string))
  const { diffOk } = await prompts({
    name: 'diffOk',
    type: 'confirm',
    message: 'Diff between dist/prod/ and published/ seems ok?'
  })
  if (diffOk !== true) {
    console.log(styles.important('Publication aborted.'))
    return process.exit(0)
  }
  console.log('')

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
        console.log(styles.important('Publication aborted.'))
        return process.exit(0)
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
        + 'The files you are trying to publish\n'
        + 'may be overwritten by future publications.\n'
        + 'Are you really sure you want to publish anyway?'
      )}`
    })
    branchOk = promptsResponse.branckOk
    if (branchOk !== true) {
      console.log(styles.important('Publication aborted.'))
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
      console.log(styles.important('Publication aborted.'))
      return process.exit(0)
    }
    console.log('')
  } else {
    const promptsResponse = await prompts({
      name: 'statusOk',
      type: 'confirm',
      message: `\n${styles.danger(
        `You are about to publish uncommited\n`
        + `changes and you probably shouldn't.\n\n`
        + `Are you perfectly sure?`.toUpperCase()
      )}`
    })
    statusOk = promptsResponse.statusOk
    if (statusOk !== true) {
      console.log(styles.important('Publication aborted.'))
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
      console.log(styles.important('Publication aborted.'))
      return process.exit(0)
    }
    console.log('')
    if (!gitBranchSeemsMaster) {
      const promptsResponse3 = await prompts({
        name: 'readyToBeFired',
        type: 'confirm',
        message: `\n${styles.danger(`No commits, not in master...\n\nWell actually if you see this,\nyou're about to be fired.\n\nHere we go?`)}`
      })
      readyToBeFired = promptsResponse3.readyToBeFired
      if (readyToBeFired !== true) {
        console.log(styles.important('Thank you. Publication aborted.'))
        return process.exit(0)
      }
    }
    console.log('')
  }

  // [WIP] Now make a zip from dist/prod (remove fonts and assets ?)
  // and store this build somewhere in ggcloud for backup reasons
  // maybe ask for a name and an description of this publication
  // and log timestamp, name, description, zip url and git status 
  // in a log file that lives in ggcloud too

  /* * * * * * * * * * * * * * * * * * * * *
  * Rsyncing
  * * * * * * * * ** * * * * * * * * * * * */
 // [WIP] Upload to ggcloud
  const { rsyncOk } = await prompts({
    name: 'rsyncOk',
    type: 'confirm',
    message: `\n${styles.danger('Ready to rsync dist/prod/ to published/ ?')}`
  })
  if (rsyncOk !== true) {
    console.log(styles.important('Publication aborted.'))
    return process.exit(0)
  }
  console.log('')
  console.log(styles.title('Rsyncing...'))
  console.log(styles.important('That\'s all good my friend.'))
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
