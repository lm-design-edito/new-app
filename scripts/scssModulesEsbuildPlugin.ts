import path from 'node:path'
import { Plugin } from 'esbuild'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import * as sass from 'sass'

const scssModulesEsbuildPlugin: Plugin = {
  name: 'lm-scss-modules-esbuild-plugin',
  setup (build) {
    /* Resolve */
    build.onResolve({ filter: /style(s)?\.module\.scss/ }, args => {
      const absPath = path.resolve(args.resolveDir, args.path)
      const relPath = path.relative(process.cwd(), absPath)
      return { path: relPath, namespace: 'lm-scss-modules-esbuild-plugin' }
    })
    /* Load */
    build.onLoad({
      filter: /.*/,
      namespace: 'lm-scss-modules-esbuild-plugin'
    }, async args => {
      const css = sass.compile(args.path).css
      let json: string | null = null
      const processed = await postcss([
        postcssModules({
          getJSON: (_, jsonContent) => {
            json = JSON.stringify(jsonContent, null, 2)
            return json
          }
        })
      ]).process(css, { from: undefined })
      const jsContents = `
        const injectStyles = window.LM_PAGE?.Apps?.injectStyles;
        if (injectStyles !== undefined) injectStyles('css', \`${processed.css}\`, \`${args.path}\`);
        export default ${json};`;
      return { contents: jsContents, loader: 'js' }
    })
  }
}

export default scssModulesEsbuildPlugin
