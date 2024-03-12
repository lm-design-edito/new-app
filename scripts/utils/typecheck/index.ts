import { exec } from 'node:child_process'
import chalk from 'chalk'
import * as config from '../../config.js'

export default async function typecheck () {
  return new Promise(resolve => {
    exec(`tsc -p ${config.SRC_TSCONFIG} --noEmit`, (err, stdout, stderr) => {
      if (stdout !== '') console.log(chalk.grey(stdout.trim().split('\n').map(l => `[typescript] ${l}`).join('\n')))
      if (stderr !== '') console.log(chalk.red(stderr.trim().split('\n').map(l => `[typescript] ${l}`).join('\n')))
      if (err !== null) console.log(chalk.red.bold(`[typescript]`, err.message.trim()))
      if (err === null && stderr === '') console.log(chalk.green.bold(`[typescript] compiled with no errors`))
      resolve(true)
    })
  })
}