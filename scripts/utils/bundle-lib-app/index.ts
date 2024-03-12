import { build } from 'esbuild'
import inlineImageModule from 'esbuild-plugin-inline-image'
import * as config from '../../config.js'
import listTsFiles from '../list-ts-files/index.js'
import lmScssModulesPlugin from '../../plugins/scss-modules-esbuild-plugin/index.js'

const inlineImagePulgin = inlineImageModule as unknown as typeof inlineImageModule.default

const componentsFiles = await listTsFiles(config.SRC_COMPONENTS, config.SRC)
const utilsFiles = await listTsFiles(config.SRC_UTILS, config.SRC)

export default async function bundleLibApp (): Promise<void> {
  try {
    const entryPoints = Object
      .entries({ ...componentsFiles, ...utilsFiles })
      .reduce((reduced, [output, input]) => {
        return [...reduced, {
          in: input,
          out: output
        }]
      }, [] as Array<{ in: string, out: string }>)
    
    await build({
      entryPoints,
      outdir: config.LIB,
      format: 'esm',
      bundle: true,
      splitting: true,
      chunkNames: 'chunks/[name].[hash]',
      minify: false,
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
      external: ['preact']
    })
  } catch (err) {

  }
}
