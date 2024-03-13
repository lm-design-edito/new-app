import { promises as fs } from 'node:fs'
import path from 'node:path'
import semver from 'semver'
import * as config from '../../config.js'
import { styles } from '../../utils/logging/index.js'

const targetVersion = semver.valid(process.env.VERSION)
if (targetVersion === null) {
  console.log(styles.error('GIVE VERSION PLZ'))
  process.exit(1)
}

export default async function writePkgJsonInLib () {
  const projectPackageJsonData = await fs.readFile(config.PACKAGEJSON, { encoding: 'utf-8' })
  const projectPackageJson = JSON.parse(projectPackageJsonData)
  const { name, type, author, license, description, repository, peerDependencies } = projectPackageJson
  const libPackageJson = {
    name,
    version: targetVersion,
    type,
    main: 'index.js',
    author,
    license,
    description,
    repository,
    peerDependencies
  }
  await fs.writeFile(
    path.join(config.LIB, 'package.json'),
    JSON.stringify(libPackageJson, null, 2) + '\n',
    { encoding: 'utf-8' }
  )
}
