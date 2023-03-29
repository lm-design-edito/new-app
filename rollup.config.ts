import fs from 'fs'
import path from 'path'
import clc from 'cli-color'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import html from '@rollup/plugin-html'
import myPlugin from './plugins/my-plugin'
import copy from 'rollup-plugin-copy'

const isProd = process.env.NODE_ENV === 'production'

const CWD = process.cwd()
const PAGES_SRC = path.join(CWD, 'src/pages')

function recurseFiles (root: string): string[] {
  const directChildren = fs.readdirSync(root)
  const files: string[] = []
  directChildren.forEach(childName => {
    const childPath = path.join(root, childName)
    const isDirectory = fs.lstatSync(childPath).isDirectory()
    if (!isDirectory) files.push(childPath)
    else files.push(...recurseFiles(childPath))
  })
  return files
}

const styles = {
  error: clc.red.bold
}

const pages = recurseFiles(PAGES_SRC)
  .filter(pagePath => {
    const ext = path.extname(pagePath)
    if (ext !== '.html') {
      const errMsg = 'Only HTML files are allowed in /src/pages/**/*'
      console.log(styles.error(errMsg))
      return false
    }
    return true
  })

// export default [...pages.map(pagePath => {
//   const pageRelPath = path.relative(PAGES_SRC, pagePath)
//   return {
//     input: pagePath,
//     output: {
//       file: isProd
//         ? path.join('dist/prod/pages', pageRelPath)
//         : path.join('dist/dev/pages', pageRelPath),
//       format: 'esm'
//     },
//     plugins: [
//       html(),
//       myPlugin(),
//       copy({
//         targets: [{
//           src: pagePath,
//           dest: isProd
//             ? path.join('dist/prod/pages', pageRelPath, '..')
//             : path.join('dist/dev/pages', pageRelPath, '..')
//         }]
//       })
//     ]
//   }
// })]

export default {
  input: pages,
  output: {
    dir: isProd
      ? path.join('dist/prod/pages')
      : path.join('dist/dev/pages')
  },
  plugins: [html(), myPlugin(), copy({
    targets: [{
      src: 'src/pages/**/*.html',
      dest: isProd  
        ? 'dist/prod/pages'
        : 'dist/dev/pages'
    }]
  })]
}

// export default [...pages.map(pagePath => {
//   const pageRelPath = path.relative(PAGES_SRC, pagePath)
//   return {
//     input: pagePath,
//     output: {
//       file: isProd
//         ? path.join('dist/prod/pages', pageRelPath)
//         : path.join('dist/dev/pages', pageRelPath)
//     },
//     plugins: [html(), myPlugin()]
//   }
// })]
