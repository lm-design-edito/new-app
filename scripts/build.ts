import { promises as fs } from 'node:fs'
import { join, relative, isAbsolute } from 'node:path'
import { exec } from 'node:child_process'
import { watch } from 'chokidar'
import chalk from 'chalk'
import { glob } from 'glob'
import * as sass from 'sass'
import { debounce } from 'throttle-debounce'
import { build, BuildOptions } from 'esbuild'
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin'
import inlineImageModule from 'esbuild-plugin-inline-image'
import * as config from './config.js'

// This in order to handle wrong typings from the lib i guess
const inlineImagePulgin = inlineImageModule as unknown as typeof inlineImageModule.default

/* BUNDLE OPTIONS * * * * * * * * * * * * */
const bundleOptions = (otherEntries: BuildOptions['entryPoints'] = {}): BuildOptions => ({
  outdir: config.DST,
  entryPoints: {
    'shared/index': config.SRC_SCRIPT,
    ...otherEntries,
  },
  format: 'esm',
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name].[hash]',
  minify: true,
  sourcemap: true,
  treeShaking: true,
  logLevel: 'info',
  target: [
    'es2020',
    'chrome63',
    'edge79',
    'firefox67',
    'safari12'
  ],
  plugins: [
    inlineImagePulgin({
      limit: -1
    }),
    sassPlugin({
      type: 'style',
      filter: /style(s)?\.module\.scss/,
      transform: postcssModules({})
    }),
    sassPlugin({
      type: 'style',
      filter: /style(s)?\.scss/
    })
  ],
  assetNames: 'assets/[name].[hash]',
  loader: {
    '.module.scss': 'json',
    '.scss': 'file'
  },
  define: {
    'process.env.PORT': process.env.PORT ?? '3000',
    'process.env.NODE_ENV': `"${process.env.NODE_ENV ?? 'developpment'}"`
  }
})

/* MAIN * * * * * * * * * * * * */
main()
async function main () {
  await rmDist()
  await makeDist()
  // Prod
  if (config.isProd) {
    const buildTimes = await copyTypeCheckAndBundle({
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
    return
  }
  // Dev
  const watcher = watch([config.SRC /*, config.MODULES*/])
  const pathsToBuild = {
    fonts: true,
    assets: true,
    styles: true,
    typeCheck: true,
    scripts: true
  }
  const debouncedBuilder = debounce(50, async () => {
    const buildTimes = await copyTypeCheckAndBundle(pathsToBuild)
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
}

/* HELPERS * * * * * * * * * * * * */

async function rmDist () {
  const { rm } = fs
  try {
    await rm(config.DST, {
      recursive: true,
      force: true
    })
  } catch (err) {}
}

async function makeDist () {
  const { mkdir } = fs
  return await mkdir(config.DST, {
    recursive: true
  })
}

async function processFonts () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_FONTS}/`,
      `${config.DST_FONTS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in processFonts')
    console.log(err)
    return
  }
}

async function processAssets () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_ASSETS}/`,
      `${config.DST_ASSETS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in processAssets')
    console.log(err)
    return
  }
}

async function processStyles () {
  const { mkdir, writeFile } = fs
  const scssFiles = await glob(`${config.SRC_STYLES}/**/*.scss`)
  for (const filePath of scssFiles) {
    const relToSrc = relative(config.SRC_STYLES, filePath)
    const dstPath = join(config.DST_STYLES, relToSrc.replace(/\.scss$/, '.css'))
    const { css, sourceMap } = sass.compile(filePath, {
      sourceMap: true,
      style: config.isProd
        ? 'compressed'
        : 'expanded'
    })
    await mkdir(join(dstPath, '..'), { recursive: true })
    await writeFile(dstPath, `${css}\n`, { encoding: 'utf-8' })
    await writeFile(`${dstPath}.map`, `${JSON.stringify(sourceMap, null, 2)}\n`, { encoding: 'utf-8' })
  }
  return scssFiles
}

async function processTypeCheck () {
  return new Promise((resolve, reject) => {
    exec(`tsc -p ${config.SRC_TSCONFIG} --noEmit`, (err, stdout, stderr) => {
      if (stdout !== '') console.log(chalk.grey(stdout.trim().split('\n').map(l => `[typescript] ${l}`).join('\n')))
      if (stderr !== '') console.log(chalk.red(stderr.trim().split('\n').map(l => `[typescript] ${l}`).join('\n')))
      if (err !== null) console.log(chalk.red.bold(`[typescript]`, err.message.trim()))
      if (err === null && stderr === '') console.log(chalk.green.bold(`[typescript] compiled with no errors`))
      resolve(true)
    })
  })
}

async function processScripts () {
  try { return await build(bundleOptions({})) }
  catch (err) { console.log(chalk.red.bold(err)) }
}

async function copyTypeCheckAndBundle (pathsToBuild: {
  fonts: boolean,
  assets: boolean,
  scripts: boolean,
  typeCheck: boolean,
  styles: boolean
}) {
  const now = Date.now()
  const times = {
    fonts: now,
    assets: now,
    scripts: now,
    styles: now,
    total: now
  }
  // Typechecking and DS_Store removal are not part of the promise
  const dsStores = await glob(join(config.SRC, '**/.DS_Store'))
  dsStores.map(async dsStore => {
    await fs.rm(dsStore)
    console.log('Removed',dsStore)
  })
  if (pathsToBuild.typeCheck === true) { processTypeCheck() }
  // Fonts, assets, styles and scripts are in the promise
  const fontsPromise = pathsToBuild.fonts === true ? processFonts() : new Promise(r => r(true))
  fontsPromise.then(() => { times.fonts = Date.now() - times.fonts })
  const assetsPromise = pathsToBuild.assets === true ? processAssets() : new Promise(r => r(true))
  assetsPromise.then(() => { times.assets = Date.now() - times.assets })
  const stylesPromise = pathsToBuild.styles === true ? processStyles() : new Promise(r => r(true))
  stylesPromise.then(() => { times.styles = Date.now() - times.styles })
  const scriptsPromise = pathsToBuild.scripts === true ? processScripts() : new Promise(r => r(true))
  scriptsPromise.then(() => { times.scripts = Date.now() - times.scripts })
  await Promise.all([
    fontsPromise,
    assetsPromise,
    stylesPromise,
    scriptsPromise
  ])
  times.total = Date.now() - times.total
  return times
}
