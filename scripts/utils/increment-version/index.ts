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
  .map((flag, flagPos, flags) => [flag, 1 + flagPos - flags.length]))

const getPrereleaseFlagPosition = (flag: PrereleaseFlag) => prereleaseFlagsToPosition.get(flag) as number

const getPrereleaseFlagByPosition = (position: number) => {
  const found = [...prereleaseFlagsToPosition.entries()].find(([, pos]) => pos === position)
  if (found === undefined) return;
  const [flag] = found
  return flag
}

const isValidPrereleaseFlag = (flag: unknown): flag is PrereleaseFlag => Object
  .values(PrereleaseFlag)
  .includes(flag as any)

//                       major,  minor,  patch,  flag,   build
type VersionNumberArr = [number, number, number, number, number]
const versionNumberToVersionNumberArr = (input: string): VersionNumberArr | undefined => {
  const parsed = semver.parse(input)
  if (parsed === null) return;
  const { major, minor, patch, prerelease } = parsed
  const [flag = PrereleaseFlag.STABLE, build = 0] = prerelease
  if (!isValidPrereleaseFlag(flag)) return;
  if (typeof build !== 'number') return;
  const flagPos = getPrereleaseFlagPosition(flag)
  return [major, minor, patch, flagPos, build]
}

const versionNumberArrToVersionNumber = (input: VersionNumberArr) => {
  const [major, minor, patch, flagPos, build] = input
  if (major < 0 || minor < 0 || patch < 0 || flagPos > 0 || build < 0) return;
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

const getComponentValue = (input: string, component: IncrementLevel) => {
  const versionNbrArr = versionNumberToVersionNumberArr(input)
  if (versionNbrArr === undefined) return;
  const posInVersionNbrArr = Object.values(IncrementLevel).reverse().indexOf(component)
  return versionNbrArr[posInVersionNbrArr]
}

const isPrerelease = (input: string) => {
  const versionNbrArr = versionNumberToVersionNumberArr(input)
  if (versionNbrArr === undefined) return false
  const flagPos = versionNbrArr[3]
  const flag = getPrereleaseFlagByPosition(flagPos)
  return flagPos !== 0 && flag !== undefined
}

export async function promptCustomVersion () {
  const { major, minor, patch, flagPos, build } = await prompts([{
    name: 'major',
    type: 'number',
    message: 'Major'
  }, {
    name: 'minor',
    type: 'number',
    message: 'Minor'
  }, {
    name: 'patch',
    type: 'number',
    message: 'Patch'
  }, {
    name: 'flagPos',
    type: 'select',
    message: 'Choose prerelease flag',
    choices: Object
      .values(PrereleaseFlag)
      .reverse()
      .map(flag => ({
        title: flag === PrereleaseFlag.STABLE 
          ? 'Not a prerelease'
          : flag,
        value: getPrereleaseFlagPosition(flag)
      }))
  }, {
    name: 'build',
    type: 'number',
    message: 'Build'
  }]) as {
    major: number,
    minor: number,
    patch: number,
    flagPos: number,
    build: number
  }
  const versionNbrArr: VersionNumberArr = [major, minor, patch, flagPos, build]
  return versionNumberArrToVersionNumber(versionNbrArr)
}

export default async function promptIncrementVersion (inputVersion: string) {
  console.log(styles.regular(`Increment from ${inputVersion}`))
  
  // Choose increment type
  const inputIsPrerelease = isPrerelease(inputVersion)
  const incrementTypeChoices: prompts.Choice[] = []
  if (inputIsPrerelease) {
    incrementTypeChoices.push(
      { title: 'Build', description: `New build version (${incrementBy(inputVersion, IncrementLevel.BUILD)} or above)`, value: 'build' },
      { title: 'Flag', description: `New prerelease version flag (${incrementBy(inputVersion, IncrementLevel.FLAG)} or above)`, value: 'flag' }
    )
  }
  incrementTypeChoices.push(
    { title: 'Patch', description: `New patch version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.PATCH)}-...)`, value: 'patch' },
    { title: 'Minor', description: `New minor version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.MINOR)}-...)`, value: 'minor' },
    { title: 'Major', description: `New major version (or prerelase, ${incrementBy(inputVersion, IncrementLevel.MAJOR)}-...)`, value: 'major' },
    { title: 'Custom', description: `Enter a version number manually`, value: 'custom' }
  )
  const { incrementType } = await prompts({
    name: 'incrementType',
    type: 'select',
    message: `\n${styles.important(`Choose the type of increment`)}`,
    choices: incrementTypeChoices
  }) as { incrementType: IncrementLevel | 'custom' }
  
  // Provide custom version number
  if (incrementType === 'custom') return await promptCustomVersion()

  const targetStableVersion = incrementBy(inputVersion, incrementType)
  const targetStableVersionArr = versionNumberToVersionNumberArr(targetStableVersion ?? '<invalid-version-nbr>')
  if (targetStableVersion === undefined || targetStableVersionArr === undefined) return;

  // Increment prerelease flag
  if (incrementType === IncrementLevel.FLAG) {
    const minimumFlagPos = targetStableVersionArr[3]
    const { incrementAmount } = await prompts({
      name: 'incrementAmount',
      type: 'select',
      message: `Specify the target prerelease flag`,
      choices: [...new Array(1 - minimumFlagPos).fill(null).map((_, pos) => {
        const flagPos = pos + minimumFlagPos
        const flag = getPrereleaseFlagByPosition(flagPos)
        if (flag === undefined) return;
        const targetVersion = setLevel(targetStableVersion, IncrementLevel.FLAG, flagPos)
        return {
          title: flag,
          description: targetVersion,
          value: targetVersion
        }
      }).filter(e => e !== undefined) as prompts.Choice[]]
    }) as { incrementAmount: string }
    return incrementAmount
  }

  // Select increment amount for major, minor, patch, or build number
  const { incrementAmount } = await prompts({
    name: 'incrementAmount',
    type: 'select',
    message: `Specify the increment amount for the ${incrementType} field of the version number`,
    choices: [...new Array(4).fill(null).map((_, pos) => {
      const description = incrementBy(targetStableVersion, incrementType, pos)
      return {
        title: `+${pos + 1}`,
        description,
        value: description
      }
    }), {
      title: 'Other',
      description: 'Enter an increment manually',
      value: 'custom'
    }]
  }) as { incrementAmount: string | undefined }
  
  if (incrementAmount === undefined) return;
  if (incrementAmount === 'custom') {
    const lowestTargetPositionNumber = getComponentValue(targetStableVersion, incrementType)
    if (lowestTargetPositionNumber === undefined) return;
    const { targetPositionNumber } = await prompts({
      name: 'targetPositionNumber',
      type: 'number',
      message: `Specify the target ${incrementType} version number (${lowestTargetPositionNumber} or above)`
    }) as { targetPositionNumber: number }
    if (targetPositionNumber < lowestTargetPositionNumber) return;
    return setLevel(targetStableVersion, incrementType, targetPositionNumber)
  }

  // If upgrade type is not major, minor, or patch, no need to ask for a prerelease flag
  if (incrementType === IncrementLevel.BUILD) return incrementAmount

  // For major, minor or patch upgrades, ask for an optional prerelease flag
  const { prereleaseFlag } = await prompts({
    name: 'prereleaseFlag',
    type: 'select',
    message: `Select an optional prerelease flag for this version`,
    choices: Object.values(PrereleaseFlag).reverse().map(flag => {
      const flagPos = getPrereleaseFlagPosition(flag)
      const targetValue = setLevel(incrementAmount, IncrementLevel.FLAG, flagPos)
      return {
        title: flag,
        description: targetValue,
        value: targetValue
      }
    })
  }) as { prereleaseFlag: string }
  return prereleaseFlag
}
