import path from 'node:path'
import { Plugin } from 'esbuild'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import * as sass from 'sass'
import * as config from '../../config.js'

const moduleName = 'lm-scss-modules-lm-slot-injection-esbuild-plugin'

const scssModulesToLmSlotsEsbuildPlugin: Plugin = {
  name: moduleName,
  setup (build) {
    /* Resolve */
    build.onResolve({ filter: /style(s)?\.module\.scss/ }, args => {
      const absPath = path.resolve(args.resolveDir, args.path)
      const relPath = path.relative(process.cwd(), absPath)
      return { path: relPath, namespace: moduleName }
    })
    /* Load */
    build.onLoad({
      filter: /.*/,
      namespace: moduleName
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
      const publicPath = path.relative(config.SRC, args.path)
      const jsContents = `
        const Slots = window.LM_PAGE?.Slots;
        const injectStyles = Slots?.injectStyles;
        const appStylesPositions = Slots?.StylesPositions?.APP;
        if (injectStyles !== undefined) injectStyles('css', \`${processed.css}\`, {
          name: \`lm-page-bundled-css__${publicPath}\`,
          position: appStylesPositions
        });
        export default ${json};`;
      return { contents: jsContents, loader: 'js' }
    })
  }
}

export default scssModulesToLmSlotsEsbuildPlugin
