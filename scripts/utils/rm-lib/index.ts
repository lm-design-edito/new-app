import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function rmLib () {
  const { rm } = fs
  try { await rm(config.LIB, { recursive: true, force: true }) }
  catch (err) {}
}
