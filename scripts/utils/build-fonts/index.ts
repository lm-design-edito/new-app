import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function buildFonts () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_FONTS}/`,
      `${config.DST_FONTS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in buildFonts')
    console.log(err)
    return
  }
}
