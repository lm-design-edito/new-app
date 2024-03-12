import chalk from 'chalk'
import { build as esbuild, BuildOptions } from 'esbuild'
import inlineImageModule from 'esbuild-plugin-inline-image'
import lmScssModulesPlugin from '../../plugins/scss-modules-esbuild-plugin/index.js'
import * as config from '../../config.js'

const inlineImagePulgin = inlineImageModule as unknown as typeof inlineImageModule.default
const builtOn = new Date()

const bundleOptions = (otherEntries: BuildOptions['entryPoints'] = {}): BuildOptions => ({
  outdir: config.DST,
  entryPoints: {
    'shared/index': config.SRC_SCRIPT,
    ...otherEntries,
  },
  format: 'esm',
  tsconfig: config.SRC_TSCONFIG_DIST,
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name].[hash]',
  minify: true,
  sourcemap: true,
  treeShaking: true,
  logLevel: 'info',
  target: [
    'es2020',
    'chrome64',
    'edge79',
    'firefox67',
    'safari12'
  ],
  plugins: [
    inlineImagePulgin({ limit: -1 }),
    lmScssModulesPlugin
  ],
  assetNames: 'assets/[name].[hash]',
  loader: {
    '.module.scss': 'json',
    '.scss': 'file'
  },
  define: {
    'process.env.PORT': process.env.PORT ?? '"3000"',
    'process.env.NODE_ENV': `"${process.env.NODE_ENV ?? 'developpment'}"`,
    'process.env.BUILT_ON': `"${builtOn.valueOf()}"`,
    'process.env.BUILT_ON_READABLE': `"${builtOn.toUTCString()}"`,
    'process.env.VERSION': `"${process.env.VERSION ?? ''}"`,
    'process.env.ROOT': `"${process.env.ROOT ?? ''}"`,
    'process.env.DEPLOYED_ON': `"${process.env.DEPLOYED_ON ?? ''}"`,
    'process.env.DEPLOYED_ON_READABLE': `"${process.env.DEPLOYED_ON_READABLE ?? ''}"`
  }
})

export default async function bundleApp () {
  try { return await esbuild(bundleOptions({})) }
  catch (err) { console.log(chalk.red.bold(err)) }
}
