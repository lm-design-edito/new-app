import { relative, isAbsolute } from 'node:path'
import chalk from 'chalk'
import { watch } from 'chokidar'
import { debounce } from 'throttle-debounce'
import * as config from './config.js'
import rmDist from './utils/rm-dist/index.js'
import makeDist from './utils/make-dist/index.js'
import buildOnce from './utils/build-once/index.js'

await rmDist()
await makeDist()

const watcher = watch([config.SRC])

const pathsToBuild = {
  fonts: true,
  assets: true,
  styles: true,
  typeCheck: true,
  scripts: true
}

const debouncedBuilder = debounce(50, async () => {
  const buildTimes = await buildOnce(pathsToBuild)
  pathsToBuild.fonts = false
  pathsToBuild.assets = false
  pathsToBuild.styles = false
  pathsToBuild.typeCheck = false
  pathsToBuild.scripts = false
  const messages = [
    `fonts:     ${buildTimes.fonts}ms`,
    `assets:    ${buildTimes.assets}ms`,
    `styles:    ${buildTimes.styles}ms`,
    `scripts:   ${buildTimes.scripts}ms`,
    chalk.bold(`total:     ${buildTimes.total}ms`)
  ]
  console.log(`\n${messages.join('\n')}\n`)
})

watcher.on('all', async (event, path) => {
  const relPathToFonts = relative(config.SRC_FONTS, path)
  const relPathToAssets = relative(config.SRC_ASSETS, path)
  const relPathToStyles = relative(config.SRC_STYLES, path)
  const isInFonts = !relPathToFonts.startsWith('..') && !isAbsolute(relPathToFonts)
  const isInAssets = !relPathToAssets.startsWith('..') && !isAbsolute(relPathToAssets)
  const isInStyles = !relPathToStyles.startsWith('..') && !isAbsolute(relPathToStyles)
  const isInScripts = !isInFonts && !isInAssets && !isInStyles
  if (isInFonts) { pathsToBuild.fonts = true }
  if (isInAssets) { pathsToBuild.assets = true }
  if (isInScripts) {
    pathsToBuild.typeCheck = true
    pathsToBuild.scripts = true
  }
  if (isInStyles) { pathsToBuild.styles = true }
  const event6char = new Array(6).fill(' ')
  event6char.splice(0, event.length, ...event.split(''))
  const message = [
    chalk.blueBright(event6char.join('')),
    chalk.grey(path)
  ].join(' ')
  console.log(message)
  debouncedBuilder()
})
