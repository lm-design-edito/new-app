import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { build, BuildOptions } from 'esbuild'
import { watch } from 'chokidar'
import { debounce } from 'throttle-debounce'
import chalk from 'chalk'
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
  minify: config.isProd,
  sourcemap: true,
  treeShaking: true,
  target: ['es2020']
})

/* MAIN * * * * * * * * * * * * */
main()
async function main () {
  await makeDist()
  // Prod
  if (config.isProd) return await Promise.all([
    copyFonts(),
    copyAssets(),
    bundleJs()
  ])
  // Dev
  const watcher = watch([config.SRC, config.MODULES])
  const debouncedWatchCallback = debounce(50, async () => {
    const copyPromise = Promise.all([copyFonts(), copyAssets()])
    const bundleStartTime = Date.now()
    let bundleEndTime = bundleStartTime
    const bundlePromise = bundleJs()
    bundlePromise.then(() => {
      bundleEndTime = Date.now()
      const buildTime = bundleEndTime - bundleStartTime
      const message = chalk.bold(`\nBuilt in ${buildTime}ms.\n`)
      console.log(message)
    })
    return await Promise.all([copyPromise, bundlePromise])
  })
  watcher.on('all', async (event, path) => {
    const event10char = new Array(10).fill(' ')
    event10char.splice(0, event.length, ...event.split(''))
    const message = [
      chalk.blueBright(event10char.join('')),
      chalk.grey(path)
    ].join(' ')
    console.log(message)
    debouncedWatchCallback()
  })
}

/* HELPERS * * * * * * * * * * * * */

async function makeDist () {
  const { mkdir } = fs
  return await mkdir(config.DST, { recursive: true })
}

async function copyFonts () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_FONTS}/`,
      `${config.DST_FONTS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in copyFonts')
    console.log(err)
    return
  }
}

async function copyAssets () {
  const { cp } = fs
  try {
    const result = await cp(
      `${config.SRC_ASSETS}/`,
      `${config.DST_ASSETS}/`,
      { recursive: true, force: true }
    )
    return result
  } catch (err) {
    console.log('ERR in copyAssets')
    console.log(err)
    return
  }
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

async function bundleJs () {
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
