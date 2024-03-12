import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function buildAssets () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_ASSETS}/`,
      `${config.DST_ASSETS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in buildAssets')
    console.log(err)
    return
  }
}
