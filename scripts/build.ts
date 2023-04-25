import { promises as fs } from 'node:fs'
import { join, relative, isAbsolute } from 'node:path'
import { build, BuildOptions } from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import sass from 'sass'
import { watch } from 'chokidar'
import { debounce } from 'throttle-debounce'
import chalk from 'chalk'
import { glob } from 'glob'
import * as config from './config.js'

/* BUNDLE OPTIONS * * * * * * * * * * * * */
const bundleOptions = (otherEntries: BuildOptions['entryPoints']): BuildOptions => ({
  outdir: config.DST,
  entryPoints: {
    'shared/scripts/index': config.SRC_SCRIPT,
    ...otherEntries,
  },
  format: 'esm',
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name].[hash]',
  minify: true,
  sourcemap: true,
  treeShaking: true,
  target: ['es2020'],
  plugins: [
    stylePlugin({ extract: false })
  ],
  assetNames: 'assets/[name].[hash]',
  loader: {
    '.svg': 'file',
    '.jpg': 'file',
    '.png': 'file',
    '.gif': 'file'
  }
})

/* MAIN * * * * * * * * * * * * */
main()
async function main () {
  await rmDist()
  await makeDist()
  // Prod
  if (config.isProd) {
    const buildTimes = await copyAndBundle({
      fonts: true,
      assets: true,
      scripts: true,
      styles: true
    })
    const messages = [
      `fonts: ${buildTimes.fonts}ms`,
      `assets: ${buildTimes.assets}ms`,
      `styles: ${buildTimes.styles}ms`,
      `scripts: ${buildTimes.scripts}ms`,
      chalk.bold(`total: ${buildTimes.total}ms`)
    ]
    console.log(`\n${messages.join('\n')}\n`)
    return
  }
  // Dev
  const watcher = watch([config.SRC, config.MODULES])
  const pathsToBuild = {
    fonts: true,
    assets: true,
    scripts: true,
    styles: true
  }
  const debouncedWatchCallback = debounce(50, async () => {
    const buildTimes = await copyAndBundle(pathsToBuild)
    pathsToBuild.fonts = false
    pathsToBuild.assets = false
    pathsToBuild.scripts = false
    pathsToBuild.styles = false
    const messages = [
      `fonts: ${buildTimes.fonts}ms`,
      `assets: ${buildTimes.assets}ms`,
      `styles: ${buildTimes.styles}ms`,
      `scripts: ${buildTimes.scripts}ms`,
      chalk.bold(`total: ${buildTimes.total}ms`)
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
    if (isInScripts) { pathsToBuild.scripts = true }
    if (isInStyles) { pathsToBuild.styles = true }
    const event6char = new Array(6).fill(' ')
    event6char.splice(0, event.length, ...event.split(''))
    const message = [
      chalk.blueBright(event6char.join('')),
      chalk.grey(path)
    ].join(' ')
    console.log(message)
    debouncedWatchCallback()
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

async function listApps () {
  const { readdir, lstat, access } = fs
  const rawList = await readdir(config.SRC_APPS)
  const list = (await Promise.all(rawList.map(async name => {
    const path = join(config.SRC_APPS, name)
    const stats = await lstat(path)
    const isDirectory = stats.isDirectory()
    if (!isDirectory) return false
    try {
      await access(join(path, 'index.tsx'))
      return join(path, 'index.tsx')
    } catch (err) {
      return false
    }
  }))).filter((path): path is string => path !== false)
  return list
}

async function getLibs () {
  const { readFile } = fs
  const packageJson = await readFile(config.PACKAGEJSON, { encoding: 'utf-8' })
  const { dependencies } = JSON.parse(packageJson)
  return dependencies
}

async function processScripts () {
  const appsEntryPoints: { [key: string]: string } = {}
  const appsList = await listApps()
  appsList.forEach(path => {
    const appName = path.split('/').at(-2)
    appsEntryPoints[`apps/${appName}/index`] = path
  })
  const libsEntryPoints: { [key: string]: string } = {}
  const libsObj = await getLibs()
  const libsList = Object.keys(libsObj)
  libsList.forEach(libName => {
    libsEntryPoints[`lib/${libName}`] = libName
  })
  const built = await build(bundleOptions({
    ...appsEntryPoints,
    ...libsEntryPoints
  }))
  return built
}

async function copyAndBundle (pathsToBuild: {
  fonts: boolean,
  assets: boolean,
  scripts: boolean,
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
