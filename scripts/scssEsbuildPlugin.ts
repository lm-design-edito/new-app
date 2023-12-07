import path from 'node:path'
import { Plugin } from 'esbuild'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import * as sass from 'sass'

const scssEsbuildPlugin: Plugin = {
  name: 'lm-scss-esbuild-plugin',
  setup (build) {
    /* Resolve */
    build.onResolve({ filter: /style(s)?\.scss/ }, args => {
      const absPath = path.resolve(args.resolveDir, args.path)
      const relPath = path.relative(process.cwd(), absPath)
      console.log('RESOLVE', relPath)
      return { path: relPath, namespace: 'lm-scss-esbuild-plugin' }
    })
    /* Load */
    build.onLoad({
      filter: /.*/,
      namespace: 'lm-scss-esbuild-plugin'
    }, async args => {
      const css = sass.compile(args.path).css
      const jsContents = `
        const style = document.createElement('style');
        style.setAttribute('name', 'lm-injected-css');
        style.setAttribute('source', '${args.path}');
        style.textContent = \`${css}\`;
        document.head.appendChild(style);
        export default {}`;
      return { contents: jsContents, loader: 'js' }
    })
  }
}

export default scssEsbuildPlugin
