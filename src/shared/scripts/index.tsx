import injectCssRule from '../../utils/dynamic-css'
import parseTextbase, { Base } from '../../utils/txt-base'
import { tsvToSheetBase as parseSheetbase } from '../../utils/sheet-base'

type PageConfig = {
  id?: string
  dataSources?: Array<{
    type: 'sheet'|'doc',
    url: string
  }>
  hideHeader?: boolean
}

async function initPage () {
  // Load styles
  const STYLES_DIR = new URL('../styles/', import.meta.url)
  const STYLES_INDEX = new URL('./index.css', STYLES_DIR)
  window.fetch(STYLES_INDEX)
    .then(res => res.text())
    .then(cssData => injectCssRule(cssData.trim()))

  // Read config
  const configTags = [...document.querySelectorAll('.lm-page-config')]
  const pageConfig: PageConfig = configTags.reduce((config, tag) => {
    const optionName = tag.getAttribute('value')
    const optionValue = tag.innerHTML
    switch (optionName) {
      case 'id':
        config.id = optionValue
        break
      case 'sheetbaseUrl':
        if (config.dataSources === undefined) {
          config.dataSources = [{
            type: 'sheet',
            url: optionValue
          }]
        } else {
          config.dataSources.push({
            type: 'sheet',
            url: optionValue
          })
        }
        break
      case 'textbaseUrl':
        if (config.dataSources === undefined) {
          config.dataSources = [{
            type: 'doc',
            url: optionValue
          }]
        } else {
          config.dataSources.push({
            type: 'doc',
            url: optionValue
          })
        }
        break
      case 'hideHeader':
        const falsyValues = ['false', 'faux', 'non', 'no', '']
        if (falsyValues.includes(optionValue.toLowerCase().trim())) { config.hideHeader = false }
        else { config.hideHeader = true }
        break
      default: break
    }
    return config
  }, {} as PageConfig)
  console.log(pageConfig)

  // Load data
  // const pageDatabase = new Base()
  const allSourcesReq = pageConfig.dataSources?.map(async dataSource => {
    try {
      const rawData = await window.fetch(dataSource.url)
      const strData = await rawData.text()
      console.log(dataSource.url)
      console.log(strData)
      const parsed = dataSource.type === 'doc'
        ? parseTextbase(strData)
        : parseSheetbase(strData)
      console.log(parsed)
      return parsed
    } catch (err) {
      return null
    }
  })
  console.log(allSourcesReq)
}

initPage()
