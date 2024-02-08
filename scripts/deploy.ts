import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import { exec } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import prompts from 'prompts'
import semver from 'semver'
import tree from 'tree-cli'
import * as config from './config.js'
import { styles } from './_logging.js'

const STATE = {
  git_status_seems_clean: false,
  git_branch_seems_master: false,
  deploy_from_outside_master: false,
  deploy_with_uncommited_changes: false,
  user_confirms_git_status_is_clean: false,
  latest_commit_number: null as null | string,
  target_name: null as null | string,
  target_url: null as null | string,
  create_new_versions_json: false,
  versions_json_content: null as null | string,
  versions_json_obj: {} as Record<string, unknown>,
  previous_version_numbers: [] as string[],
  latest_version_number: null as null | string,
  target_version_number: null as null | string,
  target_version_description: null as null | string,
  deployed_on: null as null | Date,
  deploy_mixed_versions_in_target: false
}

deploy ()

async function deploy () {
  await checkGitStatus()
  await selectTarget()
  await retreiveVersions()
  await selectVersionNumber()
  await buildSource()
  await writeVersionCommentInBundle()
  await checkDistDirTree()
  await dryRunRsync()
  await actualRsync()
  await createMilestoneCommit()
  await makeFilesPublic()
}

/* * * * * * * * * * * * * * * * * * * * *
 * Process abortion
 * * * * * * * * * * * * * * * * * * * * */
function abort () {
  console.log('')
  console.log(styles.important('Deployment aborted.'))
  return process.exit(0)
}

/* * * * * * * * * * * * * * * * * * * * *
 * Getting current GIT Status
 * * * * * * * * * * * * * * * * * * * * */
async function checkGitStatus () {
  const gitStatus = await new Promise(resolve => exec(
    `git status`,
    (err, stdout, stderr) => {
      if (err !== null || stderr !== '') {
        const errorMessage = 'Something went wrong while getting git status'
          + `\nerr: ${err}`
          + `\nstderr: ${stderr}`
          + `\nstdout: ${stdout}`
        console.log(styles.error(errorMessage))
        return abort()
      }
      resolve(stdout)
    }
  ))
  console.log(styles.title('Git status'))
  console.log(styles.regular(gitStatus as string))
  STATE.git_status_seems_clean = typeof gitStatus === 'string' && gitStatus.match(/nothing\sto\scommit/igm) !== null
  STATE.git_branch_seems_master = typeof gitStatus === 'string' && gitStatus.match(/On branch master/igm) !== null
  
  // Not in master
  if (!STATE.git_branch_seems_master) {
    const response = (await prompts({
      name: 'response',
      type: 'confirm',
      message: `\n${styles.danger(
        'You are not in the master branch.\n\n'
        + 'The files you are trying to deploy\n'
        + 'may be overwritten by future deployments.\n'
        + 'Are you really sure you want to deploy anyway?'
      )}`
    })).response
    if (response !== true) {
      console.log('')
      console.log(styles.important('Deployment aborted.'))
      return process.exit(0)
    } else {
      STATE.deploy_from_outside_master = true
    }
  }
  
  // Git status not clean
  if (!STATE.git_status_seems_clean) {
    const response1 = (await prompts({
      name: 'response',
      type: 'confirm',
      message: `\n${styles.danger(
        `You are about to deploy uncommited\n`
        + `changes and you probably shouldn't.\n\n`
        + `The deployment process implies adding\n`
        + `a milestone empty commit to your git\n`
        + `history. This operation will git reset *\n`
        + `before commiting the deployment event.\n\n`
        + `Are you perfectly sure?`.toUpperCase()
      )}`
    })).response
    if (response1 !== true) return abort()
    console.log('')

    const response2 = (await prompts({
      name: 'response',
      type: 'confirm',
      message: `\n${styles.danger('YOU SHOULD NOT DO THIS.\n\nFinal word?')}`
    })).response
    if (response2 !== true) return abort()
    console.log('')
    
    STATE.deploy_with_uncommited_changes = true
    
    if (STATE.deploy_from_outside_master) {
      const response3 = (await prompts({
        name: 'response',
        type: 'confirm',
        message: `\n${styles.danger(`No commits, not in master...\n\nWell actually if you see this,\nyou're about to get fired.\n\nLet's go?`)}`
      })).response
      if (response3 !== true) return abort()
    }
    console.log('')

  // Git status clean
  } else {
    const response = (await prompts({
      name: 'response',
      type: 'confirm',
      message: 'Git status seems ok?'
    })).response
    if (response !== true) return abort()
    STATE.user_confirms_git_status_is_clean = true
    console.log('')
  }

  // Get latest commit number
  const latestCommitNumber = await new Promise(resolve => {
    exec('git log', (err, stdout) => {
      if (err !== null) {
        console.log(styles.error(err.message))
        return abort()
      }
      const commitNumber = stdout.match(/^\s*commit\s[0-9a-f]+\s/)?.[0].replace(/^\s*commit\s/, '').trim()
      resolve(commitNumber)
    })
  }) as string | undefined
  if (latestCommitNumber === undefined) {
    console.error(styles.error(`Could not find the latest commit number, something is not right here.\n`))
    return abort()
  }
  STATE.latest_commit_number = latestCommitNumber
}

/* * * * * * * * * * * * * * * * * * * * *
 * Select target destination
 * * * * * * * * * * * * * * * * * * * * */
async function selectTarget () {
  enum Targets {
    V1_PREBETA = 'gs://decodeurs/design-edito/v1.pre-beta'
  }
  const targetToRootUrlMap = new Map<Targets, string>([
    [Targets.V1_PREBETA, 'https://assets-decodeurs.lemonde.fr/design-edito/v1.pre-beta']
  ])
  console.log(styles.title('Select a target destination'))
  STATE.target_name = (await prompts({
    name: 'response',
    type: 'select',
    message: 'destination',
    choices: Object
      .entries(Targets)
      .reverse()
      .map(([, value]) => ({ title: value, value }))
  })).response as Targets
  STATE.target_url = targetToRootUrlMap.get(STATE.target_name as Targets) ?? null
  if (STATE.target_url === null) {
    console.log(styles.error(`Something went wrong while retrieving target's url (${STATE.target_name})`))
    return abort()
  }
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Retrieving versionning info
 * * * * * * * * * * * * * * * * * * * * */
async function retreiveVersions () {
  console.log(styles.title(`Retrieving versionning info from ${STATE.target_name}/versions.json`))
  const VERSIONS_JSON_DIR = join(config.TEMP, `${Date.now()}-${randomUUID()}`)
  await fs.mkdir(VERSIONS_JSON_DIR, { recursive: true })
  let versionsJsonExists = false
  await new Promise(resolve => exec(
    `gsutil cp ${STATE.target_name}/versions.json ${VERSIONS_JSON_DIR}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      if (err === null) versionsJsonExists = true
      resolve(true)
    }
  ))
  
  // No versions.json file found
  if (!versionsJsonExists) {
    console.warn(styles.important(`versions.json seems to be missing in ${STATE.target_name}\n`))
    const response = (await prompts({
      name: 'response',
      type: 'confirm',
      message: 'Continue ?'
    })).response
    if (response !== true) return abort()
    STATE.create_new_versions_json = true
    console.log('')

  // versions.json file found
  } else {
    const VERSIONS_JSON = join(VERSIONS_JSON_DIR, 'versions.json')
    try {
      const versionsJsonStr = await fs.readFile(VERSIONS_JSON, { encoding: 'utf-8' })
      const versionsJsonParsed = JSON.parse(versionsJsonStr)
      STATE.versions_json_obj = versionsJsonParsed
      const versionNumbers = semver.sort(
        Object.keys(versionsJsonParsed as any)
          .map(versionNbr => semver.clean(versionNbr))
          .map(versionNbr => semver.valid(versionNbr) !== null ? versionNbr : null)
          .filter((versionNbr): versionNbr is string => versionNbr !== null)
      )
      STATE.previous_version_numbers = versionNumbers
      STATE.latest_version_number = versionNumbers.at(-1) ?? null
      if (STATE.latest_version_number !== undefined) console.log(styles.regular(`Latest version found: ${STATE.latest_version_number}\n`))
      else throw false
    } catch (err) {
      console.error(styles.error(`Something went wrong while parsing ${VERSIONS_JSON}. Contents:\n\n${STATE.versions_json_content}\n`))
      return abort()
    }
  }
}

/* * * * * * * * * * * * * * * * * * * * *
 * Selecting target version
 * * * * * * * * * * * * * * * * * * * * */
async function selectVersionNumber () {
  console.log(styles.title('Select the target version'))
  const prereleaseFlags = ['alpha', 'beta', 'rc']
  const riseFlagOnVersionNumber = (versionNumber: string) => {
    const alphaRegexp = /-alpha\.[0-9]+$/igm
    const betaRegexp = /-beta\.[0-9]+$/igm
    const isAlpha = versionNumber.match(alphaRegexp)
    const isBeta = versionNumber.match(betaRegexp)
    if (isAlpha) return versionNumber.replace(alphaRegexp, '-beta.0')
    if (isBeta) return versionNumber.replace(alphaRegexp, '-rc.0')
    return undefined
  }

  // If previous versions detected, ask for upgrade type
  if (STATE.latest_version_number !== null) {
    const latestVersionNbrPrerelease = semver.prerelease(STATE.latest_version_number) ?? []
    const [latestVerFlag, latestVerPrereleaseNbr] = latestVersionNbrPrerelease
    const isPrerelease = prereleaseFlags.includes(latestVerFlag as string)
      && typeof latestVerPrereleaseNbr === 'number'
    const newPrereleaseNbr = isPrerelease ? semver.inc(STATE.latest_version_number, 'prerelease') : null
    const newPrereleaseFlag = isPrerelease ? (riseFlagOnVersionNumber(STATE.latest_version_number) ?? null) : null
    // [WIP] should be possible to jump from alpha to rc here
    const newPatchVersionNbr = semver.inc(STATE.latest_version_number, 'patch')
    const newMinorVersionNbr = semver.inc(STATE.latest_version_number, 'minor')
    const newMajorVersionNbr = semver.inc(STATE.latest_version_number, 'major')
    const newMajorVersionAlphaNbr = (newMajorVersionNbr !== null && !isPrerelease) ? `${newMajorVersionNbr}-alpha.0` : null
    const newMajorVersionBetaNbr = (newMajorVersionNbr !== null && !isPrerelease) ? `${newMajorVersionNbr}-beta.0` : null
    const newMajorVersionRcNbr = (newMajorVersionNbr !== null && !isPrerelease) ? `${newMajorVersionNbr}-rc.0` : null
    const choices: Array<{ title: string, value: string | null }> = []
    if (newPrereleaseNbr !== null) choices.push({ title:        `New prerelease ${newPrereleaseNbr}`, value: newPrereleaseNbr })
    if (newPrereleaseFlag !== null) choices.push({ title:       `New prerelease flag ${newPrereleaseFlag}`, value: newPrereleaseFlag })
    if (newPatchVersionNbr !== null) choices.push({ title:      `New patch ${newPatchVersionNbr}`, value: newPatchVersionNbr })
    if (newMinorVersionNbr !== null) choices.push({ title:      `New minor ${newMinorVersionNbr}`, value: newMinorVersionNbr })
    if (newMajorVersionAlphaNbr !== null) choices.push({ title: `New alpha ${newMajorVersionAlphaNbr}`, value: newMajorVersionAlphaNbr })
    if (newMajorVersionBetaNbr !== null) choices.push({ title:  `New beta ${newMajorVersionBetaNbr}`, value: newMajorVersionBetaNbr })
    if (newMajorVersionRcNbr !== null) choices.push({ title:    `New rc ${newMajorVersionRcNbr}`, value: newMajorVersionRcNbr })
    if (newMajorVersionNbr !== null) choices.push({ title:      `New major ${newMajorVersionNbr}`, value: newMajorVersionNbr })
    choices.push({ title: `Custom version number`, value: null })
    const response = (await prompts({
      name: 'response',
      message: 'Target version',
      type: 'select',
      choices
    })).response
    STATE.target_version_number = response
  } else {
    console.log(styles.regular('No previous version detected in this target destination, you will have to manually choose the target version number:\n'))
    STATE.target_version_number = null
  }

  // Set a custom target version
  if (STATE.target_version_number === null) {
    const { prereleaseFlag } = await prompts({
      name: 'prereleaseFlag',
      message: 'Version is a prerelease?',
      type: 'select',
      choices: [
        { title: 'No', value: null },
        { title: 'Alpha', value: 'alpha' },
        { title: 'Beta', value: 'beta' },
        { title: 'RC', value: 'rc' }
      ]
    })
    let prereleaseNbr: null | number = null
    if (prereleaseFlag !== null) {
      prereleaseNbr = (await prompts({
        name: 'prereleaseNbr',
        message: `${prereleaseFlag} number`,
        type: 'number'
      })).prereleaseNbr
    }
    const { majorNbr, minorNbr, patchNbr } = await prompts([
      { name: 'majorNbr', message: 'major:', type: 'number' },
      { name: 'minorNbr', message: 'minor:', type: 'number' },
      { name: 'patchNbr', message: 'patch:', type: 'number' }
    ])
    let customTargetVersion = `${majorNbr}.${minorNbr}.${patchNbr}`
    if (prereleaseFlag !== null && prereleaseNbr !== null) { customTargetVersion += `-${prereleaseFlag}.${prereleaseNbr}` }
    if (semver.valid(customTargetVersion) === null) {
      console.log(styles.error(`Custom version number ${customTargetVersion} is not valid.`))
      return abort()
    }
    STATE.target_version_number = customTargetVersion
  }
  console.log(styles.important(`\nTarget version: ${STATE.target_version_number}\n`))

  // Multiple majors in target
  const targetHasMultipleMajors = STATE.previous_version_numbers.some(prevVersionNbr => {
    const prevMajor = semver.major(prevVersionNbr)
    if (STATE.target_version_number === null) return true
    const currMajor = semver.major(STATE.target_version_number)
    return prevMajor !== currMajor
  })
  if (targetHasMultipleMajors) {
    const message = `It seems that you want to deploy a build for major version ${STATE.target_version_number}\n`
                  + `in a target that contains builds for other major versions.\n\n`
                  + `You may want to change the target destination in order to avoid\n`
                  + `deploying breaking changes to projects that are already live.`
    console.log(styles.danger(message))
    console.log('')
    const { continueAnyway } = await prompts({
      name: 'continueAnyway',
      type: 'confirm',
      message: 'Continue anyway? (Definitely NOT recommended)'
    })
    console.log('')
    if (continueAnyway !== true) return abort()
    STATE.deploy_mixed_versions_in_target = true
  }

  // Description
  STATE.target_version_description = (await prompts({
    type: 'text',
    name: 'versionDescription',
    message: 'Description for this version:'
  })).versionDescription
  console.log('')
}

async function buildSource () {
  console.log(styles.title(`Building source`))
  try {
    STATE.deployed_on = new Date()
    const deployedOnReadable = STATE.deployed_on.toUTCString()
    await new Promise(resolve => exec(
      `NODE_ENV=production VERSION="${STATE.target_version_number}" ROOT="${STATE.target_url}" DEPLOYED_ON="${STATE.deployed_on}" DEPLOYED_ON_READABLE="${deployedOnReadable}" npm run build-source:prod`,
      (err, stdout, stderr) => {
        if (err !== null) console.error(styles.error(err.message))
        if (stderr !== '' && err === null) console.log(styles.regular(stderr))
        if (stdout !== '') console.log(styles.regular(stdout))
        resolve(true)
      }
    ))
  } catch (err) {
    return abort()
  }
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Write version comment in bundle
 * * * * * * * * * * * * * * * * * * * * */
async function writeVersionCommentInBundle () {
  const deployedOn = STATE.deployed_on ?? new Date()
  const deployedOnReadable = deployedOn.toUTCString()
  const thisVersionJsonData = {
    description: (STATE.target_version_description ?? '') as string,
    deployedOn: deployedOn.valueOf(),
    deployedOnReadable: deployedOnReadable,
    commit: STATE.git_status_seems_clean
      ? STATE.latest_commit_number
      : `${STATE.latest_commit_number} (with uncommited changes)`
  }
  if (STATE.target_version_number === null) {
    console.log(styles.error(`Target version number is null and should not be at this point.`))
    return abort()
  }
  const newVersionsJsonObj = {
    ...STATE.versions_json_obj,
    [STATE.target_version_number]: thisVersionJsonData
  }
  await fs.writeFile(
    join(config.DST_PROD, 'versions.json'),
    JSON.stringify(newVersionsJsonObj, null, 2),
    { encoding: 'utf-8' }
  )
  const DST_PROD_SHARED_INDEX = join(config.DST_PROD, 'shared', 'index.js')
  const dstProdSharedContent = await fs.readFile(DST_PROD_SHARED_INDEX, { encoding: 'utf-8' })
  const dstProdSharedAppendedContent = `/* v.${STATE.target_version_number} */`
  await fs.writeFile(DST_PROD_SHARED_INDEX, `${dstProdSharedAppendedContent} ${dstProdSharedContent}`)
  const DST_PROD_SHARED_INDEX_VERSIONNED = join(config.DST_PROD, 'shared', `index.v${STATE.target_version_number}.js`)
  await fs.copyFile(DST_PROD_SHARED_INDEX, DST_PROD_SHARED_INDEX_VERSIONNED)
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Check dist/prod tree
 * * * * * * * * * * * * * * * * * * * * */
async function checkDistDirTree() {
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
  if (distTreeOk !== true) return abort()
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Rsync dry run
 * * * * * * * * * * * * * * * * * * * * */
async function dryRunRsync () {
  console.log(styles.title(`Dry running rsync to ${STATE.target_name}`))
  await new Promise(resolve => exec(
    `gsutil -m -h "Cache-Control:public, max-age=60" rsync -ncrpj html,js,map,css,svg,png,jpg,gif,woff,woff2,eot,ttf ${config.DST_PROD}/ ${STATE.target_name}/`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      resolve(true)
    }
  ))
  const { dryRunSeemsOk1 } = await prompts({
    name: 'dryRunSeemsOk1',
    type: 'confirm',
    message: `\n${styles.danger(`All good, ready to deploy to:\n${STATE.target_name}\n\nAfter this message, files get actually deployed.\n\nLet's go?`)}`
  })
  if (dryRunSeemsOk1 !== true) return abort()
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Actual Rsync
 * * * * * * * * * * * * * * * * * * * * */
async function actualRsync () {
  console.log(styles.title(`Rsyncing to ${STATE.target_name}`))
  await new Promise(resolve => exec(
    `gsutil -m -h "Cache-Control:public, max-age=60" rsync -crpj html,js,map,css,svg,png,jpg,gif,woff,woff2,eot,ttf ${config.DST_PROD}/ ${STATE.target_name}/`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      resolve(true)
    }
  ))
  await new Promise(resolve => exec(
    `gsutil cp ${join(config.DST_PROD, 'versions.json')} ${STATE.target_name}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      resolve(true)
    }
  ))
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Create a milestone commit
 * * * * * * * * * * * * * * * * * * * * */
async function createMilestoneCommit () {
  console.log(styles.title(`Creating a milestone empty commit`))
  await new Promise(resolve => exec(
    `git reset * && git commit --allow-empty -m "[deployment] - v.${STATE.target_version_number} - ${STATE.target_name}"`,
    (err, stdout, stderr) => {
      if (err !== null || stderr !== '') {
        const errorMessage = 'Something went wrong while creating the milestone commit'
          + `\nerr: ${err}`
          + `\nstderr: ${stderr}`
          + `\nstdout: ${stdout}`
        console.log(styles.error(errorMessage))
        console.log('')
        console.log(styles.important('You should do this by hand since the deployment has already been done.'))
        console.log(styles.regular(`git reset * && git commit --allow-empty -m "[deployment] v.${STATE.target_version_number} / ${STATE.target_name}"`))
        console.log('')
      }
      resolve(stdout)
    }
  ))
  console.log(styles.regular(`[deployment] - v.${STATE.target_version_number} - ${STATE.target_name}`))
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Making files public
 * * * * * * * * * * * * * * * * * * * * */
async function makeFilesPublic () {
  console.log(styles.title(`Making files public`))
  await new Promise(resolve => exec(
    `gsutil -m acl -r ch -u allUsers:R ${STATE.target_name}`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      resolve(true)
    }
  ))
  console.log('')
  console.log(styles.important('That\'s all good my friend. 🍸\n\n'))
}
