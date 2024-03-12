import { promises as fs } from 'node:fs'
import { join, relative } from 'node:path'
import * as sass from 'sass'
import { glob } from 'glob'
import * as config from '../../config.js'

export default async function buildStyles () {
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
