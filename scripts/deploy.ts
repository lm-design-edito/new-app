import path from 'node:path'
import { promises as fs } from 'node:fs'
import { exec } from 'node:child_process'
import crypto from 'node:crypto'
import prompts from 'prompts'
import semver from 'semver'
import tree from 'tree-cli'
import * as config from './config.js'
import { styles } from './utils/logging/index.js'
import promptIncrementVersion, { promptCustomVersion } from './utils/increment-version/index.js'
import unknownErrToString from './utils/unknown-err-to-string/index.js'

const STATE = {
  git_status_seems_clean: false as boolean,
  deploy_with_uncommited_changes: false as boolean,
  user_confirms_git_status_is_clean: false as boolean,
  latest_commit_number: null as null | string,
  target_name: null as null | string,
  target_url: null as null | string,
  create_new_versions_json: false as boolean,
  versions_json_content: null as null | string,
  versions_json_obj: {} as Record<string, unknown>,
  latest_local_version_number: null as null | string,
  latest_bucket_version_number: null as null | string,
  target_npm_registry_lookup_error: false as boolean,
  target_npm_registry: null as null | string,
  published_to_npm: false as boolean,
  published_to_bucket: false as boolean,
  local_version_file_written: false as boolean,
  target_version_number: null as null | string,
  target_version_description: null as null | string,
  deployed_on: null as null | Date,
  milestone_commit_created: false as boolean
}

deploy ()

async function deploy () {
  await checkGitStatus()
  await getLatestLocalVersionFound()
  await askForTargetVersion()
  await chooseAvailableBucket()
  await retreiveBucketVersions()
  await buildSourceForLib()
  await buildSourceForDist()
  await npmPublishLib()
  await writeVersionCommentInBundle()
  await checkDistDirTree()
  await dryRunRsync()
  await actualRsync()
  await createLocalVersionFile()
  await createMilestoneCommit()
  await makeFilesPublic()
}

/* * * * * * * * * * * * * * * * * * * * *
 * Process abortion
 * * * * * * * * * * * * * * * * * * * * */
function abort () {
  if (STATE.published_to_npm && !STATE.published_to_bucket) {
    console.error(styles.danger(
      `This version has already been published\n`
      + `to ${STATE.target_npm_registry}.\n\n`
      + `You might consider unpublishing it quick.`
    ))
  } else if (STATE.published_to_npm
    && STATE.published_to_bucket
    && !STATE.local_version_file_written) {
    console.error(styles.danger(
      `This version has already been published\n`
      + `to both destinations:\n\n`
      + `- ${STATE.target_npm_registry}\n`
      + `- ${STATE.target_name}\n\n`
      + `Version file has not been written in .versions/\n\n`
      + `You might consider unpublishing the files quick.\n\n`
      + `Alternatively, you can write the version file yourself\n`
      + `and create a milestone commit manually.`
    ))
    console.log('')
    console.log(styles.important('Here is the current deployment process state:'))
    console.log(JSON.stringify(STATE, null, 2))
  }
  console.log('')
  console.log(styles.danger('Deployment aborted.'))
  console.log('')
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
        + `history.\n\n`
        + `This operation will:\n\n`
        + `- git reset *\n`
        + `- commit the deployment event.\n\n`
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
 * Getting latest local version found
 * * * * * * * * * * * * * * * * * * * * */
async function getLatestLocalVersionFound () {
  console.log(styles.title(`Retrieving version history`))
  try {
    const versionsFileNames = await fs.readdir(config.VERSIONS)
    const versionsList = versionsFileNames.map(fileName => path.parse(fileName).name)
    const validated = versionsList.filter(fileName => semver.valid(fileName) !== null)
    const sorted = semver.sort(validated)
    const latest = sorted.at(-1)
    STATE.latest_local_version_number = latest ?? null
    if (latest === undefined) console.log(styles.warning(`No previous version data found in .versions, you will be asked to enter the target version number manually`))
    else console.log(styles.regular(`Latest version found: ${latest}`))
    console.log('')
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while getting latest version:\n${errStr}`))
    return abort()
  }
}

/* * * * * * * * * * * * * * * * * * * * *
 * Ask for target version
 * * * * * * * * * * * * * * * * * * * * */
async function askForTargetVersion () {
  console.log(styles.title(`Select target version`))
  try {
    let targetVersionNumber: string | undefined = undefined
    if (STATE.latest_local_version_number === null) { targetVersionNumber = await promptCustomVersion() }
    else { targetVersionNumber = await promptIncrementVersion(STATE.latest_local_version_number) }
    if (targetVersionNumber === undefined) throw new Error('Target version number cannot be undefined')
    STATE.target_version_number = targetVersionNumber ?? null
    STATE.target_version_description = (await prompts({
      type: 'text',
      name: 'versionDescription',
      message: 'Description for this version:'
    })).versionDescription
    console.log('')
    console.log(styles.regular(`Target version: ${targetVersionNumber} - ${STATE.target_version_description}`))
    console.log('')
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while selecting target version:\n${errStr}`))
    return abort()
  }
}

/* * * * * * * * * * * * * * * * * * * * *
 * Choose available bucket
 * * * * * * * * * * * * * * * * * * * * */
async function chooseAvailableBucket () {
  console.log(styles.title(`Destination bucket selection`))
  const targetVersionNumber = STATE.target_version_number as string // Previous step throws if null
  const availableBuckets = Array.from(config.bucketsMetadataMap.entries()).filter(([_, bucketData]) => {
    const { versionRange } = bucketData
    return semver.satisfies(targetVersionNumber, versionRange)
  })
  if (availableBuckets.length <= 0) {
    console.error(styles.error(`No buckets are available for target version ${targetVersionNumber}. See config file at ${config.SCRIPTS_CONFIG}`))
    return abort()
  }
  const { targetBucket } = await prompts({
    name: 'targetBucket',
    type: 'select',
    message: `Select target destination for dist deployment`,
    choices: availableBuckets.map(([bucketName, bucketData]) => {
      return {
        title: bucketName,
        description: `${bucketData.versionRange} - ${bucketData.publicUrl}`,
        value: bucketName
      }
    })
  }) as { targetBucket: config.Bucket }
  STATE.target_name = targetBucket
  const targetBucketData = config.bucketsMetadataMap.get(targetBucket) as config.BucketMetaData
  STATE.target_url = targetBucketData.publicUrl
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Select target bucket
 * * * * * * * * * * * * * * * * * * * * */
/*
async function selectTargetBucket () {
  enum Targets {
    V1_BETA = 'gs://decodeurs/design-edito/v1.beta'
  }
  const targetToRootUrlMap = new Map<Targets, string>([
    [Targets.V1_BETA, 'https://assets-decodeurs.lemonde.fr/design-edito/v1.beta']
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
*/

/* * * * * * * * * * * * * * * * * * * * *
 * Retrieving versionning info
 * * * * * * * * * * * * * * * * * * * * */
async function retreiveBucketVersions () {
  console.log(styles.title(`Retrieving versionning info from ${STATE.target_name}/versions.json`))
  const VERSIONS_JSON_DIR = path.join(config.TEMP, `${Date.now()}-${crypto.randomUUID()}`)
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
    const VERSIONS_JSON = path.join(VERSIONS_JSON_DIR, 'versions.json')
    try {
      const versionsJsonStr = await fs.readFile(VERSIONS_JSON, { encoding: 'utf-8' })
      const versionsJsonParsed = JSON.parse(versionsJsonStr)
      STATE.versions_json_obj = versionsJsonParsed
      const targetVersionAlreadyExists = Object.keys(versionsJsonParsed).some(version => version === STATE.target_version_number)
      if (targetVersionAlreadyExists) {
        console.error(styles.error(`The target version selected (${STATE.target_version_number}) already exist in target destination ${STATE.target_name}. Please choose an other version number or bucket.`))
        return abort()
      }
      const versionNumbers = semver.sort(
        Object.keys(versionsJsonParsed as any)
          .map(versionNbr => semver.clean(versionNbr))
          .map(versionNbr => semver.valid(versionNbr) !== null ? versionNbr : null)
          .filter((versionNbr): versionNbr is string => versionNbr !== null)
      )

      STATE.latest_local_version_number = versionNumbers.at(-1) ?? null
      if (STATE.latest_local_version_number !== undefined) {
        console.log(styles.regular(`Latest dist version found in bucket ${STATE.target_name}: ${STATE.latest_local_version_number}\n`))

      }
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
/*
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
  if (STATE.latest_local_version_number !== null) {
    const latestVersionNbrPrerelease = semver.prerelease(STATE.latest_local_version_number) ?? []
    const [latestVerFlag, latestVerPrereleaseNbr] = latestVersionNbrPrerelease
    const isPrerelease = prereleaseFlags.includes(latestVerFlag as string)
      && typeof latestVerPrereleaseNbr === 'number'
    const newPrereleaseNbr = isPrerelease ? semver.inc(STATE.latest_local_version_number, 'prerelease') : null
    const newPrereleaseFlag = isPrerelease ? (riseFlagOnVersionNumber(STATE.latest_local_version_number) ?? null) : null
    // [WIP] should be possible to jump from alpha to rc here
    const newPatchVersionNbr = semver.inc(STATE.latest_local_version_number, 'patch')
    const newMinorVersionNbr = semver.inc(STATE.latest_local_version_number, 'minor')
    const newMajorVersionNbr = semver.inc(STATE.latest_local_version_number, 'major')
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
*/

/* * * * * * * * * * * * * * * * * * * * *
 * Build source for Dist
 * * * * * * * * * * * * * * * * * * * * */
async function buildSourceForDist () {
  console.log(styles.title(`Building source for dist`))
  try {
    STATE.deployed_on = new Date()
    const deployedOnReadable = STATE.deployed_on.toUTCString()
    await new Promise(resolve => exec(
      'NODE_ENV=production'
      + ` VERSION="${STATE.target_version_number}"`
      + ` ROOT="${STATE.target_url}"`
      + ` DEPLOYED_ON="${STATE.deployed_on}"`
      + ` DEPLOYED_ON_READABLE="${deployedOnReadable}"`
      + ` npm run build-dist:prod`,
      (err, stdout, stderr) => {
        if (err !== null) console.error(styles.error(err.message))
        if (stderr !== '' && err === null) console.log(styles.regular(stderr))
        if (stdout !== '') console.log(styles.regular(stdout))
        resolve(true)
      }
    ))
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while building source for dist:\n${errStr}`))
    return abort()
  }
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Build source for Lib
 * * * * * * * * * * * * * * * * * * * * */
async function buildSourceForLib () {
  console.log(styles.title(`Building source for lib`))
  try {
    await new Promise(resolve => exec(
      `NODE_ENV=production VERSION="${STATE.target_version_number}" npm run build-lib`,
      (err, stdout, stderr) => {
        if (err !== null) console.error(styles.error(err.message))
        if (stderr !== '' && err === null) console.log(styles.regular(stderr))
        if (stdout !== '') console.log(styles.regular(stdout))
        resolve(true)
      }
    ))
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while building source for lib:\n${errStr}`))
    return abort()
  }
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * NPM publish lib
 * * * * * * * * * * * * * * * * * * * * */
async function npmPublishLib () {
  console.log(styles.title(`Publishing lib to npm`))
  try {
    console.log(styles.regular(`Current npm registry lookup...\n`))
    await new Promise(resolve => exec(
      'npm config get registry',
      (err, stdout, stderr) => {
        if (err !== null) {
          STATE.target_npm_registry_lookup_error = true
          console.error(styles.error(err.message))
        }
        if (stderr !== '' && err === null) {
          STATE.target_npm_registry_lookup_error = true
          console.log(styles.regular(stderr))
        }
        if (stdout !== '') {
          STATE.target_npm_registry = stdout.trim()
          console.log(styles.regular(stdout))
        }
        resolve(true)
      }
    ))
    if (!config.allowedNpmRegistries.includes(new URL(STATE.target_npm_registry as string).toString())) {
      console.error(styles.error(`The target npm registry ${STATE.target_npm_registry} is not allowed (see config file at ${config.SCRIPTS_CONFIG})`))
      abort()
    }
    if (new URL(STATE.target_npm_registry ?? '').toString() !== config.preferredNpmRegistry) {
      console.log(styles.danger(
        `You are about to publish this npm package\n`
        + `to a non official npm registry,\n`
        + `and YOU SHOULD NOT.`
      ))
      console.log('')
      const { confirmWrongNpmRegistry } = await prompts({
        name: 'confirmWrongNpmRegistry',
        type: 'confirm',
        message: 'Are you sure?'
      }) as { confirmWrongNpmRegistry: boolean }
      if (!confirmWrongNpmRegistry) {
        console.error(styles.error(`You can set the npm registry you want via: 'npm set registry <https://registry.url>'`))
        return abort()
      }
      const { confirmWrongNpmRegistryBis } = await prompts({
        name: 'confirmWrongNpmRegistryBis',
        type: 'confirm',
        message: 'That is very wrong. Last call: sure?'
      }) as { confirmWrongNpmRegistryBis: boolean }
      if (!confirmWrongNpmRegistryBis) {
        console.error(styles.error(`You can set the npm registry you want via: 'npm set registry <https://registry.url>'`))
        return abort()
      }
    }
    await new Promise(resolve => exec(
      `npm run publish-lib`,
      (err, stdout, stderr) => {
        if (err !== null) throw err
        if (stderr !== '' && err === null) console.log(styles.regular(stderr))
        if (stdout !== '') console.log(styles.regular(stdout)) // It seems every text output is in stderr
        resolve(true)
      }
    ))
    STATE.published_to_npm = true
    console.log(styles.info(`Published ${STATE.target_version_number} to npm registry: ${STATE.target_npm_registry}`))
    console.log('')
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while publishing lib to npm:\n\n${errStr}`))
    return abort()
  }
}

/* * * * * * * * * * * * * * * * * * * * *
 * Write version comment in bundle
 * * * * * * * * * * * * * * * * * * * * */
async function writeVersionCommentInBundle () {
  try {
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
      path.join(config.DST_PROD, 'versions.json'),
      JSON.stringify(newVersionsJsonObj, null, 2),
      { encoding: 'utf-8' }
    )
    const DST_PROD_SHARED_INDEX = path.join(config.DST_PROD, 'shared', 'index.js')
    const dstProdSharedContent = await fs.readFile(DST_PROD_SHARED_INDEX, { encoding: 'utf-8' })
    const dstProdSharedAppendedContent = `/* v.${STATE.target_version_number} */`
    await fs.writeFile(DST_PROD_SHARED_INDEX, `${dstProdSharedAppendedContent} ${dstProdSharedContent}`)
    const DST_PROD_SHARED_INDEX_VERSIONNED = path.join(config.DST_PROD, 'shared', `index.v${STATE.target_version_number}.js`)
    await fs.copyFile(DST_PROD_SHARED_INDEX, DST_PROD_SHARED_INDEX_VERSIONNED)
    console.log('')
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while writing the version comment in the dist bundle:\n\n${errStr}`))
    console.log('')
    return abort()
  }
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
    `gsutil cp ${path.join(config.DST_PROD, 'versions.json')} ${STATE.target_name}/versions.json`,
    (err, stdout, stderr) => {
      if (err !== null) console.error(styles.error(err.message))
      if (stderr !== '' && err === null) console.log(styles.regular(stderr))
      if (stdout !== '') console.log(styles.regular(stdout))
      resolve(true)
    }
  ))
  STATE.published_to_bucket = true
  console.log('')
}

/* * * * * * * * * * * * * * * * * * * * *
 * Create local version file
 * * * * * * * * * * * * * * * * * * * * */
async function createLocalVersionFile () {
  console.log(styles.title(`Create local version file`))
  const targetVersionNumber = STATE.target_version_number as string
  const filePath = path.join(config.VERSIONS, `${targetVersionNumber}.json`)
  try {
    let alreadyExists = false
    try {
      await fs.access(filePath)
      alreadyExists = true
    } catch {}
    if (alreadyExists) throw new Error(`A file already exists at path ${filePath}`)
    const versionData = {
      build: {
        version_number: STATE.target_version_number,
        version_description: STATE.target_version_description,
        timestamp: STATE.deployed_on,
        previous_local_version: STATE.latest_local_version_number,
      },
      git: {
        has_uncommited_changes: STATE.deploy_with_uncommited_changes,
        latest_commit_number: STATE.latest_commit_number,
      },
      bucket: {
        name: STATE.target_name,
        url: STATE.target_url,
        current_versions_json: STATE.create_new_versions_json ? null : STATE.versions_json_obj,
        create_versions_json: STATE.create_new_versions_json,
        latest_version_found: STATE.latest_bucket_version_number,
        published: STATE.published_to_bucket
      },
      npm: {
        registry: STATE.target_npm_registry,
        published: STATE.published_to_npm
      }
    }
    await fs.writeFile(
      filePath,
      JSON.stringify(versionData, null, 2),
      { encoding: 'utf-8' }
    )
    console.log(styles.regular(`Written ${filePath}`))
    console.log('')
  } catch (err) {
    const errStr = unknownErrToString(err)
    console.error(styles.error(`Something went wrong while writing the local version file:\n\n${errStr}`))
    console.log('')
    return abort()
  }
}

/* * * * * * * * * * * * * * * * * * * * *
 * Create a milestone commit
 * * * * * * * * * * * * * * * * * * * * */
async function createMilestoneCommit () {
  console.log(styles.title(`Creating a milestone empty commit`))
  await new Promise(resolve => exec(
    `git reset * && git add .versions && git commit --allow-empty -m "[deployment] - v.${STATE.target_version_number} - ${STATE.target_name}"`,
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
  STATE.milestone_commit_created = true
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
