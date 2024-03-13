import { promises as fs } from 'node:fs'
import path from 'node:path'
import * as config from '../../config.js'

const fileContent = `
# README
`

export default async function writeReadmeFileInLib () {
  await fs.writeFile(
    path.join(config.LIB, 'README.md'),
    fileContent.trim() + '\n',
    { encoding: 'utf-8' }
  )
}
