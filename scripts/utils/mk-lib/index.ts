import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function mkLib () {
  const { mkdir } = fs
  return await mkdir(config.LIB, { recursive: true })
}