import { promises as fs } from 'node:fs'
import * as config from '../../config.js'

export default async function rmDist () {
  const { rm } = fs
  try { await rm(config.DST, { recursive: true, force: true }) }
  catch (err) {}
}
