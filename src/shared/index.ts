import { expose, GlobalKey } from '~/shared/lm-page-globals'
import { PageConfig } from '~/shared/lm-page-config'
import Logger from '~/utils/silent-log'
import appConfig from './config'
import { Darkdouille } from './utils/darkdouille'
import toString from './utils/darkdouille/transformers/toString'
import isArrayOf from '~/utils/is-array-of'

/* * * * * * * * * * * * * * * * * * * * * *
 * SILENT LOGGER
 * * * * * * * * * * * * * * * * * * * * * */
const logger = new Logger()
expose(GlobalKey.SILENT_LOGGER, logger)

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
const searchParams = new URLSearchParams(appConfig.paths.SCRIPTS_INDEX_URL.search)
const shouldntInit = searchParams.has('noInit')
if (!shouldntInit) initPage()

export async function initPage () {
  logger.log('Page initialization', `Start init the page from ${appConfig.paths.SCRIPTS_INDEX_URL.toString()}`)

  /* STYLES * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Keep lm-page-stylesheet elements at the end of the body
  // [WIP] find something better after Adaptation
  const lmPageStylesheets = [...document.querySelectorAll('link[href^="https://assets-decodeurs.lemonde.fr/redacweb"]')]
  document.body.append(...lmPageStylesheets.map(node => node.cloneNode()))
  lmPageStylesheets.forEach(stylesheetNode => stylesheetNode.remove())

  // Load styles (dont await)
  const makeLink = (href: string, rel: string = 'stylesheet') => {
    const link = document.createElement('link')
    link.setAttribute('rel', rel)
    link.setAttribute('href', href)
    return link
  }
  const mainStyles = appConfig.paths.STYLES_INDEX_URL.toString()
  const devStyles = appConfig.paths.STYLES_DEV_URL.toString()
  const { head } = document
  head.appendChild(makeLink(mainStyles))
  if (appConfig.env === 'developpment') head.appendChild(makeLink(devStyles))

  /* INLINE CONFIG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Find, merge and evaluate inline page data
  const pageInlineDataNodes = document.body.querySelectorAll(appConfig.dataSourceSelector)
  const pageInlineDataNodesCopy = [...pageInlineDataNodes].map(e => e.cloneNode(true)) as Element[]
  const pageInlineDataValue = Darkdouille.tree(...pageInlineDataNodes).value
  logger.log('Inline data', pageInlineDataValue)
  const pageInlineDataValueIsRecord = Darkdouille.valueIsRecord(pageInlineDataValue)
  const pageDataConfigCollectionName = appConfig.dataSourcesReservedNames.config
  const pageInlineDataRawConfigInstructions = pageInlineDataValueIsRecord
    && Array.isArray(pageInlineDataValue[pageDataConfigCollectionName])
    ? pageInlineDataValue[pageDataConfigCollectionName] as Darkdouille.TreeValue[]
    : []
  const pageInlineDataConfigInstructions = pageInlineDataRawConfigInstructions.map(instruction => {
    const isRecord = Darkdouille.valueIsRecord(instruction)
    if (!isRecord) return { name: '', value: undefined }
    const { name, value } = instruction
    const strName = toString()(name)
    return Object
      .values(PageConfig.InlineOnlyInstructionName)
      .includes(strName as any)
      ? { name: strName, value }
      : { name: '', value: undefined }
  }).filter(e => e.name !== '')

  // Load sources
  const pageInlineDataConfigSources = pageInlineDataConfigInstructions.filter((instruction): instruction is {
    name: PageConfig.InlineOnlyInstructionName,
    value: string
  } => {
    const { name, value } = instruction
    const { SOURCE } = PageConfig.InlineOnlyInstructionName
    return name === SOURCE && typeof value === 'string'
  })
  logger.log('Remote sources', 'URLS', `\n${pageInlineDataConfigSources.map(e => e.value).join('\n').trim()}`)
  const pageInlineDataConfigSourcesPromises = pageInlineDataConfigSources.map(async ({ value }) => {
    try {
      const res = await window.fetch(value)
      if (res.ok) {
        logger.log('Remote sources', `LOADED: ${value}`, res)
        return await res.text()
      }
      throw new Error(res.statusText)
    } catch (err) {
      logger.error('Remote sources', `ERROR: ${value}`, err)
    }
  })

  /* FULL CONFIG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  const pageRemoteDataStrings = await Promise.all(pageInlineDataConfigSourcesPromises)
  const pageRemoteDataNodes = pageRemoteDataStrings
    .filter((data): data is string => data !== undefined)
    .map(data => {
      const wrapper = document.createElement('data')
      wrapper.innerHTML += data
      return wrapper
    })
  const pageFullDataValue = Darkdouille.tree(...pageInlineDataNodesCopy, ...pageRemoteDataNodes).value
  logger.log('Full data', pageFullDataValue)
  const pageFullDataValueIsRecord = Darkdouille.valueIsRecord(pageFullDataValue)
  const pageDataSlotsCollectionName = appConfig.dataSourcesReservedNames.slots
  const pageFullDataConfig = pageFullDataValueIsRecord ? pageFullDataValue[pageDataConfigCollectionName] : undefined
  const pageFullDataSlots = pageFullDataValueIsRecord ? pageFullDataValue[pageDataSlotsCollectionName] : undefined

  // Apply config
  const pageFullDataConfigIsArray = Array.isArray(pageFullDataConfig)
  const pageFullDataRawConfig: PageConfig.ConfigInstruction[] = pageFullDataConfigIsArray
    ? pageFullDataConfig.filter((instruction): instruction is PageConfig.ConfigInstruction => {
      if (!Darkdouille.valueIsRecord(instruction)) return false
      const { name } = instruction
      const validInstructionsNames: string[] = [
        ...Object.values(PageConfig.InlineOnlyInstructionName),
        ...Object.values(PageConfig.RemoteInstructionName)
      ]
      return validInstructionsNames.includes(name as string)
    })
    : []
  PageConfig.apply(pageFullDataRawConfig, logger)

  /* RENDER APPS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  enum AppName {
    ANYCOMP_FOR_DEV_ONLY = 'anycomp-for-dev',
    ARTICLE = 'article',
    AUDIOQUOTE = 'audioquote',
    CAROUSEL = 'carousel',
    EVENT_DISPATCHER = 'event-dispatcher',
    FOOTER = 'footer',
    HEADER = 'header',
    SCRLLGNGN = 'scrllgngn',
    SLIDESHOW = 'slideshow',
    THUMBNAIL = 'thumbnail'
  }
  
  // Render in slots
  const slotsIsArray = Array.isArray(pageFullDataSlots)
  type SlotData = {
    app: AppName
    selector: string | [string, string, string] // [target, position, reference]
    options: Darkdouille.TreeValue
  }
  if (slotsIsArray) {
    const elementsRenderersAndOptions = pageFullDataSlots
      .filter((value): value is SlotData => {
        if (!Darkdouille.valueIsRecord(value)) return false
        const { app, selector } = value
        if (typeof app !== 'string') return false
        if (!Object.values(AppName).includes(app as any)) return false
        const selectorIsString = typeof selector === 'string'
        const selectorIsArrayOfStrings = isArrayOf(selector, String) && selector.length === 3
        if (!selectorIsString && !selectorIsArrayOfStrings) return false
        return true
      })
      .map(({ app, selector, options }) => {
        
        /* {
          elements: HTMLElement[]
          renderer: Renderer
          options: Darkdouille.TreeValue
        } */
      })
    console.log(pageFullDataSlots)
  }

  // logger.log('page-config/inline-instructions', inlineConfigInstructions.getAll().map(ins => `${ins.name}: ${ins.value}`).join('\n'))
  // logger.log('page-config/inline-config', inlinePageConfig)

  // Read inline config
  // const inlineConfigInstructions = getInlineConfigInstructrions()
  // const inlinePageConfig = inlineConfigInstructions.toConfig()
  
}
