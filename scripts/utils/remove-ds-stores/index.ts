import { promises as fs } from 'node:fs'
import { glob } from 'glob'
import { join } from 'path'
import * as config from '../../config.js'

export default async function removeDsStores () {
  const dsStores = await glob(join(config.SRC, '**/.DS_Store'))
  return await Promise.all(dsStores.map(async dsStore => {
    await fs.rm(dsStore)
    console.log('Removed', dsStore)
  }))
}
