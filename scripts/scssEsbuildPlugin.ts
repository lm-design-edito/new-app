import path from 'node:path'
import { Plugin } from 'esbuild'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import * as sass from 'sass'

const myScssEsbuildPlugin: Plugin = {
  name: 'my-scss-esbuild-plugin',
  setup (build) {
    /* Resolve */
    build.onResolve({ filter: /style(s)?\.module\.scss/ }, args => {
      const absPath = path.resolve(args.resolveDir, args.path)
      const relPath = path.relative(process.cwd(), absPath)
      return { path: relPath, namespace: 'my-scss-esbuild-plugin' }
    })
    /* Load */
    build.onLoad({
      filter: /.*/,
      namespace: 'my-scss-esbuild-plugin'
    }, async args => {
      const css = sass.compile(args.path).css
      let json: string | null = null
      const processed = await postcss([
        postcssModules({
          getJSON: (filePath, jsonContent) => {
            json = JSON.stringify(jsonContent, null, 2)
            return json
          }
        })
      ]).process(css, { from: undefined })
      const jsContents = `
        const style = document.createElement('style');
        style.setAttribute('name', 'zzzzz');
        style.textContent = \`${processed.css}\`;
        document.head.appendChild(style);
        const styles = ${json};
        export default styles;
      `;
      return { contents: jsContents, loader: 'js' }
    })
  }
}

export default myScssEsbuildPlugin
