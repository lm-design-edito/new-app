import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function makeDist () {
  const { mkdir } = fs
  return await mkdir(config.DST, { recursive: true })
}
