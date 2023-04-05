import packageJson from '../package.json' assert { type: 'json' }
import path from 'node:path'
import { watch, RollupWatchOptions } from 'rollup'
import glob from 'glob'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

const args = process.argv.slice(2)
const isProd = args.includes('prod')
const shouldWatch = args.includes('watch')

const CWD = process.cwd()
const APPSPATHS = glob.sync(path.join(CWD, 'src/apps/**/index.tsx'))
const PAGESPATHS = glob.sync(path.join(CWD, 'src/pages/**/index.html'))
const libsList = Object.keys(packageJson.dependencies)

const options: RollupWatchOptions[] = [...PAGESPATHS.map(PAGEPATH => {
  const pageName = PAGEPATH
    .replace(/\/index.html$/, '')
    .split('/')
    .at(-1)
  console.log(pageName)
  return {
    input: { [`pages/${pageName}/index.html`]: PAGEPATH },
    output: {
      dir: isProd ? 'dist/prod' : 'dist/dev'
    }
  }
}), {
  input: { 'shared/scripts/index': 'src/shared/scripts/index.ts' },
  output: {
    preserveModules: !isProd,
    format: 'es',
    dir: isProd ? 'dist/prod' : 'dist/dev',
    manualChunks: !isProd ? undefined : id => {
      if (!isProd) return
      if (id.includes('node_modules')) {
        for (const libName of libsList) {
          if (id.includes(libName)) return `libs/${libName}/index`
        }
      }
      for (const APPPATH of APPSPATHS) {
        if (id.includes(APPPATH)) {
          const now = Date.now()
          const uuid = Math.random().toString(36).slice(2)
          const defaultAppName = `no-name-${now}-${uuid}`
          const appName = APPPATH
            .replace(/\/index\.tsx$/, '')
            .split('/').at(-1) ?? defaultAppName
          return `apps/${appName}/index`
        }
      }
    }
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    isProd && terser()
  ]
}]

const watcher = watch(options)
watcher.on('event', event => {
  if ('result' in event) event.result?.close()
  console.log(event)
  if (shouldWatch) return
  if (event.code === 'END'
    || event.code === 'ERROR') {
    watcher.close()
    process.exit(0)
  }
})
