import { promises as fs } from 'node:fs'
import path from 'node:path'
import * as config from '../../config.js'

const fileContent = `export default {} /* All the lib exports are located in /components and /utils */\n`

export default async function writeMainFileInLib () {
  await fs.writeFile(
    path.join(config.LIB, 'index.js'),
    fileContent,
    { encoding: 'utf-8' }
  )
}
