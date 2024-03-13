import path from 'node:path'
import { Plugin } from 'esbuild'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import * as sass from 'sass'
import * as config from '../../config.js'

const moduleName = 'lm-scss-modules-head-injection-esbuild-plugin'

const scssModulesToHeadEsbuildPlugin: Plugin = {
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
        if (typeof window.lm_components_css_modules_injector === 'function') {
          window.lm_components_css_modules_injector(\`${processed.css}\`, \`${publicPath}\`, ${json !== null ? `\`${json}\`` : 'null'});
        } else {
          const styleTag = document.createElement('style');
          styleTag.setAttribute('data-source', 'lm-components-css-module-injection');
          styleTag.setAttribute('data-source-file', \`${publicPath}\`);
          styleTag.innerHTML += \`${processed.css}\`
          document.head.append(styleTag);
        }
        export default ${json};`
      return { contents: jsContents, loader: 'js' }
    })
  }
}

export default scssModulesToHeadEsbuildPlugin
