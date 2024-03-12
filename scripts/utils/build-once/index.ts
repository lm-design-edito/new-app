import buildAssets from '../build-assets/index.js'
import buildFonts from '../build-fonts/index.js'
import buildStyles from '../build-styles/index.js'
import bundleApp from '../bundle-dist-app/index.js'
import typecheck from '../typecheck/index.js'
import rmDsStores from '../remove-ds-stores/index.js'

export default async function buildOnce (_toBuild: {
  fonts?: boolean,
  assets?: boolean,
  scripts?: boolean,
  typeCheck?: boolean,
  styles?: boolean
}) {
  const toBuild = {
    fonts: _toBuild.fonts !== undefined ? _toBuild.fonts : true,
    assets: _toBuild.assets !== undefined ? _toBuild.assets : true,
    scripts: _toBuild.scripts !== undefined ? _toBuild.scripts : true,
    typeCheck: _toBuild.typeCheck !== undefined ? _toBuild.typeCheck : true,
    styles: _toBuild.styles !== undefined ? _toBuild.styles : true
  }
  const now = Date.now()
  const times = { fonts: now, assets: now, scripts: now, styles: now, total: now }
  
  // Typechecking and DS_Store removal are not awaited
  rmDsStores()
  if (toBuild.typeCheck === true) { typecheck() }
  
  // Fonts
  const fontsPromise = toBuild.fonts === true ? buildFonts() : new Promise(r => r(true))
  fontsPromise.then(() => { times.fonts = Date.now() - times.fonts })
  
  // Assets
  const assetsPromise = toBuild.assets === true ? buildAssets() : new Promise(r => r(true))
  assetsPromise.then(() => { times.assets = Date.now() - times.assets })
  
  // Styles
  const stylesPromise = toBuild.styles === true ? buildStyles() : new Promise(r => r(true))
  stylesPromise.then(() => { times.styles = Date.now() - times.styles })
  
  // JS
  const scriptsPromise = toBuild.scripts === true ? bundleApp() : new Promise(r => r(true))
  scriptsPromise.then(() => { times.scripts = Date.now() - times.scripts })
  
  // Await everything
  await Promise.all([
    fontsPromise,
    assetsPromise,
    stylesPromise,
    scriptsPromise
  ])
  
  // Return durations
  times.total = Date.now() - times.total
  return times
}
