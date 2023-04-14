import injectCssRule from './utils/dynamic-css'
const STYLES_DIR = new URL('../styles/', import.meta.url)
const STYLES_INDEX = new URL('./index.css', STYLES_DIR)
const STYLES_PLUGIN = new URL('./plugin.css', STYLES_DIR)
console.log(import.meta.url)
console.log(STYLES_DIR.toString())
console.log(STYLES_INDEX.toString())

async function initPage () {
  const stylesIndexResponse = await window.fetch(STYLES_INDEX)
  const stylesIndexData = await stylesIndexResponse.text()
  const stylesPluginResponse = await window.fetch(STYLES_PLUGIN)
  const stylesPluginData = await stylesPluginResponse.text()
  injectCssRule(stylesIndexData.trim())
  injectCssRule(stylesPluginData.trim())
  console.log('Init page')
}

initPage()
