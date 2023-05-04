import { getInlineConfigInstructrions, getRemoteConfigInstructions, applyConfig, Instructions } from '~/shared/lm-page-config'
import { makePageDatabase, filterPageDatabase } from '~/shared/lm-page-database'
import { getPageSlotsMap, renderApp } from '~/shared/lm-page-apps'
import { expose, GlobalKey } from '~/shared/lm-page-globals'
import flattenGetters from '~/utils/flatten-getters'
import Logger from '~/utils/silent-log'
import { injectStylesheet } from '~/utils/dynamic-css'

/* * * * * * * * * * * * * * * * * * * * * *
 * URLS
 * * * * * * * * * * * * * * * * * * * * * */
// [WIP] maybe store this in a config file, with generic stuff like 
// PAGE_SLOTS and PAGE_CONFIG for reserved collections, etc...
const ROOT_URL = new URL('../', import.meta.url)            // ROOT
const SHARED_URL = new URL('shared/', ROOT_URL)                // shared/
const SCRIPTS_INDEX_URL = new URL(import.meta.url)             // shared/index.js
const STYLES_URL = new URL('styles/', SHARED_URL)              // shared/styles/
const STYLES_INDEX_URL = new URL('index.css', STYLES_URL)      // shared/styles/index.css
const STYLES_DEV_URL = new URL('developpment.css', STYLES_URL) // shared/styles/developpment.css

/* * * * * * * * * * * * * * * * * * * * * *
 * SILENT LOGGER
 * * * * * * * * * * * * * * * * * * * * * */
const silentLogger = new Logger()
expose(GlobalKey.SILENT_LOGGER, silentLogger)

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
const searchParams = new URLSearchParams(SCRIPTS_INDEX_URL.search)
const shouldntInit = searchParams.has('noInit')
if (!shouldntInit) initPage()
export async function initPage () {
  silentLogger.log('page-init', `Start init the page from ${SCRIPTS_INDEX_URL.toString()}`)
  // Load styles (dont await)
  injectStylesheet(STYLES_INDEX_URL, STYLES_INDEX_URL.toString())
    .then(res => {
      if (typeof res === 'string') silentLogger.log('page-styles', `Injected ${STYLES_INDEX_URL.toString()}`)
      else silentLogger.error('page-styles', res)
  })
  if (process.env.NODE_ENV === 'developpment') {
    injectStylesheet(STYLES_DEV_URL, STYLES_DEV_URL.toString())
      .then(res => {
        if (typeof res === 'string') silentLogger.log('page-styles', `Injected ${STYLES_DEV_URL.toString()}`)
        else silentLogger.error('page-styles', res)
    })
  }

  // Read inline config
  const inlineConfigInstructions = getInlineConfigInstructrions()
  const inlinePageConfig = inlineConfigInstructions.toConfig()
  silentLogger.log('page-config/inline-instructions', inlineConfigInstructions.getAll().map(ins => `${ins.name}: ${ins.value}`).join('\n'))
  silentLogger.log('page-config/inline-config', inlinePageConfig)

  // Load & filter data sources
  const inlineDataSources = inlinePageConfig.dataSources
  const rawPageDatabase = await makePageDatabase(inlineDataSources)
  silentLogger.warn('page-database/parsing-errors', rawPageDatabase.errors.map(error => {
    const { line, message, dataSource } = error
    const { url } = dataSource
    return `line ${line} @ ${url}\n${message}`
  }).join('\n—\n'))
  silentLogger.log('page-database/raw', flattenGetters(rawPageDatabase.result.value))
  const pageDatabase = inlinePageConfig.id !== undefined
    ? filterPageDatabase(rawPageDatabase.result.clone(), inlinePageConfig.id)
    : rawPageDatabase.result
  expose(GlobalKey.DATABASE, pageDatabase)
  silentLogger.log('page-database/filtered', flattenGetters(pageDatabase.value))

  // Merge remote configs
  const pageConfigCollection = pageDatabase.get('PAGE_CONFIG')
  const remoteConfigInstructions = getRemoteConfigInstructions(pageConfigCollection)
  const pageConfigInstructions = Instructions.merge(
    inlineConfigInstructions,
    remoteConfigInstructions)
  const pageConfig = pageConfigInstructions.toConfig()
  silentLogger.log('page-config/remote-instructions', remoteConfigInstructions.getAll().map(ins => `${ins.name}: ${ins.value}`).join('\n'))
  silentLogger.log('page-config/merged-config', pageConfig)

  // Apply config
  applyConfig(pageConfig, {
    onHeaderHidden: headerElements => {
      if (headerElements === null) silentLogger.warn('page-config/hideHeader', 'No header elements to hide')
      else silentLogger.log('page-config/hideHeader', 'Hidden elements:', headerElements)
    },
    onScrollStarted: logResult => {
      const { amplitude, atInternet } = logResult
      if (amplitude instanceof Error) silentLogger.warn('page-config/tracking/scroll-started/amplitude', amplitude.message)
      else silentLogger.log('page-config/tracking/scroll-started/amplitude', 'sent')
      if (atInternet instanceof Error) silentLogger.warn('page-config/tracking/scroll-started/at-internet', atInternet.message)
      else silentLogger.log('page-config/tracking/scroll-started/at-internet', 'sent')
    },
    onHalfReached: logResult => {
      const { amplitude, atInternet } = logResult
      if (amplitude instanceof Error) silentLogger.warn('page-config/tracking/half-reached/amplitude', amplitude.message)
      else silentLogger.log('page-config/tracking/half-reached/amplitude', 'sent')
      if (atInternet instanceof Error) silentLogger.warn('page-config/tracking/half-reached/at-internet', atInternet.message)
      else silentLogger.log('page-config/tracking/half-reached/at-internet', 'sent')
    },
    onEndReached: logResult => {
      const { amplitude, atInternet } = logResult
      if (amplitude instanceof Error) silentLogger.warn('page-config/tracking/end-reached/amplitude', amplitude.message)
      else silentLogger.log('page-config/tracking/end-reached/amplitude', 'sent')
      if (atInternet instanceof Error) silentLogger.warn('page-config/tracking/end-reached/at-internet', atInternet.message)
      else silentLogger.log('page-config/tracking/end-reached/at-internet', 'sent')
    },
    onCssInjected: (key, css) => {
      silentLogger.log('page-config/css-injected', 'key:', key, '\ncss:', css)
    }
  })
  
  // Get page slots
  const pageSlotsCollection = pageDatabase.get('PAGE_SLOTS')
  const pageSlotsMap = getPageSlotsMap(pageSlotsCollection) // [WIP] maybe split this
  silentLogger.log('page-apps/slots-map', pageSlotsMap)
  
  // Render apps
  silentLogger.log('page-apps/rendering', 'Starting apps rendering.')
  pageSlotsMap.forEach(async ({ name, options }, root) => {
    try { await renderApp({ name, options, root, pageConfig, silentLogger }) }
    catch (err) { silentLogger.error('page-apps/rendering-failure', { root, name, options, err }) }
  })
}