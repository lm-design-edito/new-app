import chalk from 'chalk'
import rmDist from './utils/rm-dist/index.js'
import makeDist from './utils/make-dist/index.js'
import buildOnce from './utils/build-once/index.js'

await rmDist()
await makeDist()

const buildTimes = await buildOnce({
  fonts: true,
  assets: true,
  styles: true,
  typeCheck: true,
  scripts: true
})

const messages = [
  `fonts:     ${buildTimes.fonts}ms`,
  `assets:    ${buildTimes.assets}ms`,
  `styles:    ${buildTimes.styles}ms`,
  `scripts:   ${buildTimes.scripts}ms`,
  chalk.bold(`total:     ${buildTimes.total}ms`)
]

console.log(`\n${messages.join('\n')}\n`)
