import prompts from 'prompts'
import semver from 'semver'
import { styles } from '../logging/index.js'

enum PrereleaseFlag {
  AANISHA = 'aanisha',
  ALPHA = 'alpha',
  BENEDICT = 'benedict',
  BETA = 'beta',
  DAYTONA = 'daytona',
  DELTA = 'delta',
  RAVEN = 'raven',
  RC = 'rc',
  STABLE = 'stable'
}

const prereleaseFlagsToPosition = new Map(Object
  .values(PrereleaseFlag)
  .map((flag, flagPos, flags) => [
    flag,
    1 + flagPos - flags.length
  ])
)

const getPrereleaseFlagPosition = (flag: PrereleaseFlag) => {
  const pos = prereleaseFlagsToPosition.get(flag) as number
  return pos
}

const getPrereleaseFlagByPosition = (position: number) => {
  const found = [...prereleaseFlagsToPosition.entries()].find(([_, pos]) => pos === position)
  if (found === undefined) return;
  const [flag] = found
  return flag
}

const isValidPrereleaseFlag = (flag: unknown): flag is PrereleaseFlag => {
  return Object
    .values(PrereleaseFlag)
    .includes(flag as any)
}

//                       major,  minor,  patch, flag,    build
type VersionNumberArr = [number, number, number, number, number]
const versionNumberToVersionNumberArr = (input: string): VersionNumberArr | undefined => {
  const parsed = semver.parse(input)
  if (parsed === null) return;
  const { major, minor, patch, prerelease } = parsed
  const [flag = PrereleaseFlag.STABLE, build = 0] = prerelease
  if (!isValidPrereleaseFlag(flag)) return;
  if (typeof build !== 'number') return;
  const isPrerelease = prerelease.length > 0
  const flagPos = getPrereleaseFlagPosition(flag)
  return [major, minor, patch, flagPos, build]
}

const versionNumberArrToVersionNumber = (input: VersionNumberArr) => {
  const [major, minor, patch, flagPos, build] = input
  const flag = getPrereleaseFlagByPosition(flagPos)
  if (flagPos === 0 || flag === undefined) return `${major}.${minor}.${patch}`
  return `${major}.${minor}.${patch}-${flag}.${build}`
}

enum IncrementLevel {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
  FLAG = 'flag',
  BUILD = 'build'
}

const incrementBy = (input: string, level?: IncrementLevel, amount: number = 1) => {
  const versionNbrArr = versionNumberToVersionNumberArr(input)
  if (versionNbrArr === undefined) return;
  const [major, minor, patch, flagPos, build] = versionNbrArr
  if (level === IncrementLevel.MAJOR) return versionNumberArrToVersionNumber([major + amount, 0, 0, 0, 0])
  if (level === IncrementLevel.MINOR) return versionNumberArrToVersionNumber([major, minor + amount, 0, 0, 0])
  if (level === IncrementLevel.PATCH) return versionNumberArrToVersionNumber([major, minor, patch + amount, 0, 0])
  if (level === IncrementLevel.FLAG) return versionNumberArrToVersionNumber([major, minor, patch, Math.min(flagPos + amount, 0), 0])
  else return versionNumberArrToVersionNumber([major, minor, patch, flagPos, build + amount])
}

const setLevel = (input: string, level: IncrementLevel, newValue: number) => {
  const versionNbrArr = versionNumberToVersionNumberArr(input)
  if (versionNbrArr === undefined) return;
  const [major, minor, patch, flagPos, build] = versionNbrArr
  if (level === IncrementLevel.MAJOR) return versionNumberArrToVersionNumber([newValue, minor, patch, flagPos, build])
  if (level === IncrementLevel.MINOR) return versionNumberArrToVersionNumber([major, newValue, patch, flagPos, build])
  if (level === IncrementLevel.PATCH) return versionNumberArrToVersionNumber([major, minor, newValue, flagPos, build])
  if (level === IncrementLevel.FLAG) {
    const newFlag = getPrereleaseFlagByPosition(newValue)
    if (newFlag === undefined) return;
    return versionNumberArrToVersionNumber([major, minor, patch, newValue, build])
  }
  else return versionNumberArrToVersionNumber([major, minor, patch, flagPos, newValue])
}

const isPrerelease = (input: string) => {
  const versionNbrArr = versionNumberToVersionNumberArr(input)
  if (versionNbrArr === undefined) return false
  const flagPos = versionNbrArr[3]
  const flag = getPrereleaseFlagByPosition(flagPos)
  return flagPos !== 0 && flag !== undefined
}

export default async function incrementVersion (inputVersion: string) {
  console.log(styles.info(`Increment from ${inputVersion}`))

  const incrementTypeChoices: prompts.Choice[] = [
    { title: 'Major', description: `New major version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.MAJOR)}-...)`, value: 'major' },
    { title: 'Minor', description: `New minor version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.MINOR)}-...)`, value: 'minor' },
    { title: 'Patch', description: `New patch version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.PATCH)}-...)`, value: 'patch' }
  ]

  const inputIsPrerelease = isPrerelease(inputVersion)
  if (inputIsPrerelease) {
    incrementTypeChoices.push(
      { title: 'Flag', description: `New prerelease version flag (${incrementBy(inputVersion, IncrementLevel.FLAG)} or above)`, value: 'flag' },
      { title: 'Build', description: `New build version (${incrementBy(inputVersion, IncrementLevel.BUILD)} or above)`, value: 'build' },
    )
  }

  await prompts({
    name: 'incrementType',
    type: 'select',
    message: `\n${styles.important(`Choose the type of increment`)}`,
    choices: incrementTypeChoices
  })



  // Input check
  // const inputVersion = semver.valid(rawInputVersion)
  // const parsedInputVersion = semver.parse(inputVersion)
  // if (inputVersion === null || parsedInputVersion === null) {
  //   const errorMessage = `Invalid input version: ${rawInputVersion}`
  //   console.log(styles.error(errorMessage))
  //   return new Error(errorMessage)
  // }
  // console.log(styles.info(`Increment from ${rawInputVersion}`))

  // Input data extraction
  // const { major, minor, patch, prerelease } = parsedInputVersion
  // const [flag, build] = prerelease
  // const inputIsPrerelease = prerelease.length > 0
  // const inputFlagIsInvalid = inputIsPrerelease && !isValidCommonPrereleaseFlag(flag)
  // const inputBuildIsInvalid = inputIsPrerelease && typeof build !== 'number'
  // if (inputFlagIsInvalid || inputBuildIsInvalid) {
  //   const errorMessage = `Invalid input version: ${rawInputVersion}`
  //   console.log(styles.error(errorMessage))
  //   return new Error(errorMessage)
  // }

  // Infer next stable versions
  // const stableTargetVersions = {
  //   major: semver.inc(inputVersion, 'major') as string,
  //   minor: semver.inc(inputVersion, 'minor') as string,
  //   patch: semver.inc(inputVersion, 'patch') as string
  // }
  // const stableTargetVersionsHasAProblem = Object.values(stableTargetVersions).some(val => typeof val !== 'string')
  // if (stableTargetVersionsHasAProblem) {
  //   const errorMessage = `Invalid infered stable versions: ${Object.values(stableTargetVersions).join(', ')}`
  //   console.log(styles.error(errorMessage))
  //   return new Error(errorMessage)
  // }
  
  // Ask for increment type
  // const incrementTypeChoices: prompts.Choice[] = [
  //   { title: 'Major', description: stableTargetVersions.major, value: stableTargetVersions.major },
  //   { title: 'Minor', description: stableTargetVersions.minor, value: stableTargetVersions.minor },
  //   { title: 'Patch', description: stableTargetVersions.patch, value: stableTargetVersions.patch }
  // ]
  // if (inputIsPrerelease) {
  //   const nextPrereleaseCommonFlag = incrementPrereleaseCommonFlag(inputVersion)
  //   const nextPrereleaseFlag = incrementPrereleaseFlag(inputVersion)
  //   const nextPrereleaseBuild = incrementPrereleaseBuild(inputVersion)
  //   if (nextPrereleaseCommonFlag === undefined
  //     || nextPrereleaseFlag === undefined
  //     || nextPrereleaseBuild === undefined) {
  //     const errorMessage = `Invalid infered prerelease versions: ${nextPrereleaseCommonFlag}, ${nextPrereleaseFlag}, ${nextPrereleaseBuild}`
  //     console.log(styles.error(errorMessage))
  //     return new Error(errorMessage)
  //   }
  //   incrementTypeChoices.push(
  //     { title: 'Prerelease common flag', description:  }
  //   )
  // }
  // const incrementType = (await prompts({
  //   name: 'incrementType',
  //   type: 'select',
  //   message: `\n${styles.important(`Choose the type of increment`)}`,
  //   choices: [
  //     { title: 'Major', description: stableTargetVersions.major, value: stableTargetVersions.major },
  //     { title: 'Minor', description: stableTargetVersions.minor, value: stableTargetVersions.minor },
  //     { title: 'Patch', description: stableTargetVersions.patch, value: stableTargetVersions.patch },
  //   ]
  // })).incrementType
  
  // console.log(incrementType)








  // if (incrementType !== true) {
  //   console.log('')
  //   console.log(styles.important('Deployment aborted.'))
  //   return process.exit(0)
  // } else {
  //   STATE.deploy_from_outside_master = true
  // }

  // Major ?
    // - with prerelease flag ?
      // - choose flag
      // - choose build ?

  // Minor ?
    // - with prerelease flag ?
      // - choose flag
      // - choose number ?

  // Patch ?
    // - with prerelease flag ?
      // - choose flag
      // - choose build ?

  // Flag ?
    // - choose flag
    // - choose build if not STABLE

  // Current Prerelease build
}

// enum CommonPrereleaseFlag {
//   ALPHA = PrereleaseFlag.ALPHA,
//   BETA = PrereleaseFlag.BETA,
//   DELTA = PrereleaseFlag.DELTA,
//   RC = PrereleaseFlag.RC,
//   STABLE = PrereleaseFlag.STABLE
// }

// const sortedPrereleaseFlags = Object.values(PrereleaseFlag).sort((a, b) => a.localeCompare(b))
// const prereleaseFlagNameToVersionNumberArrPositionMap = new Map<PrereleaseFlag, number>(sortedPrereleaseFlags.map((flag, flagPos) => ([flag, 1 + flagPos - sortedPrereleaseFlags.length])))

// const sortedCommonPrereleaseFlags = Object.values(CommonPrereleaseFlag).sort((a, b) => a.localeCompare(b))
// const isValidPrereleaseFlag = (input: unknown): input is PrereleaseFlag => sortedPrereleaseFlags.includes(input as any)
// const isValidCommonPrereleaseFlag = (input: unknown): input is CommonPrereleaseFlag => sortedCommonPrereleaseFlags.includes(input as any)

// const incrementPrereleaseFlag = (input: string) => {
//   const parsed = semver.parse(input)
//   if (parsed === null) return;
//   const { major, minor, patch, prerelease } = parsed
//   const [flag] = prerelease
//   if (!isValidPrereleaseFlag(flag)) return;
//   const flagPos = sortedPrereleaseFlags.indexOf(flag)
//   if (flagPos === -1) return;
//   const newFlag = sortedPrereleaseFlags[flagPos]
//   if (newFlag === undefined) return;
//   return `${major}.${minor}.${patch}-${newFlag}.0`
// }

// const incrementPrereleaseCommonFlag = (input: string) => {
//   const parsed = semver.parse(input)
//   if (parsed === null) return;
//   const { major, minor, patch, prerelease } = parsed
//   const [flag] = prerelease
//   if (!isValidCommonPrereleaseFlag(flag)) return;
//   const flagPos = sortedCommonPrereleaseFlags.indexOf(flag)
//   if (flagPos === -1) return;
//   const newFlag = sortedPrereleaseFlags[flagPos]
//   if (newFlag === undefined) return;
//   return `${major}.${minor}.${patch}-${newFlag}.0`
// }

// const incrementPrereleaseBuild = (input: string) => {
//   const parsed = semver.parse(input)
//   if (parsed === null) return;
//   const { major, minor, patch, prerelease } = parsed
//   const [flag, build] = prerelease
//   if (!isValidCommonPrereleaseFlag(flag)) return;
//   if (typeof build !== 'number') return;
//   return `${major}.${minor}.${patch}-${flag}.${build + 1}`
// }

