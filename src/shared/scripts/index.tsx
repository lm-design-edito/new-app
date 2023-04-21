import {
  injectDefaultStyles
} from './utils/lm-page-styles'
import {
  getInlineConfigInstructrions,
  getRemoteConfigInstructions,
  applyConfig,
  Instructions
} from './utils/lm-page-config'
import {
  makePageDatabase,
  filterPageDatabase
} from './utils/lm-page-database'
import {
  flattenGetters,
  getPageSlotsMap,
  renderApp
} from './utils/lm-page-apps'
import Logger from '../../utils/silent-log'

/* * * * * * * * * * * * * * * * * * * * * *
 * URLS
 * * * * * * * * * * * * * * * * * * * * * */
// [WIP] why exporting this? Maybe just pass those as parameters
// where needed?
// [WIP] maybe store this in a config file, with generic stuff like 
// PAGE_SLOTS and PAGE_CONFIG for reserved collections, etc...
export const PAGE_URL = new URL(window.location.href)                 // PAGE
export const ROOT_URL = new URL('../../', import.meta.url)            // ROOT
export const SHARED_URL = new URL('shared/', ROOT_URL)                // shared/
export const ASSETS_URL = new URL('assets/', SHARED_URL)              // assets/
export const FONTS_URL = new URL('fonts/', SHARED_URL)                // fonts/
export const SCRIPTS_URL = new URL('scripts/', SHARED_URL)            // scripts/
export const SCRIPTS_INDEX_URL = new URL(import.meta.url)             // scripts/index.js
export const STYLES_URL = new URL('styles/', SHARED_URL)              // styles/
export const STYLES_INDEX_URL = new URL('index.css', STYLES_URL)      // styles/index.css

/* * * * * * * * * * * * * * * * * * * * * *
 * SILENT LOGGER
 * * * * * * * * * * * * * * * * * * * * * */
// [WIP] idem, no need to export i think
export const silentLogger = new Logger()
// [WIP] Give a type to LM_PAGE ?
// Should only be used in the console by the end user though
;(window as any).LM_PAGE = { silentLogger }

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
const searchParams = new URLSearchParams(SCRIPTS_INDEX_URL.search)
const shouldntInit = searchParams.has('noInit')
if (!shouldntInit) initPage()
export async function initPage () {
  silentLogger.log('page-init', `Start init the page from ${SCRIPTS_INDEX_URL.toString()}`)

  // Load styles (dont await)
  injectDefaultStyles().then(res => {
    if (typeof res === 'string') return;
    silentLogger.error('page-styles', res)
  })

  // Read inline config
  const inlineConfigInstructions = getInlineConfigInstructrions()
  const inlinePageConfig = inlineConfigInstructions.toConfig()
  silentLogger.table('page-config/inline-instructions', inlineConfigInstructions.getAll())
  silentLogger.log('page-config/inline-config', inlinePageConfig)

  // Load & filter data sources
  const inlineDataSources = inlinePageConfig.dataSources
  const unfilteredPageDatabase = await makePageDatabase(inlineDataSources)
  const pageDatabase = inlinePageConfig.id !== undefined
    ? filterPageDatabase(unfilteredPageDatabase.clone(), inlinePageConfig.id)
    : unfilteredPageDatabase
  silentLogger.log('page-database/unfiltered', flattenGetters(unfilteredPageDatabase.value))
  silentLogger.log('page-database/filtered', flattenGetters(pageDatabase.value))

  // Merge remote configs
  const pageConfigCollection = pageDatabase.get('PAGE_CONFIG')
  const remoteConfigInstructions = getRemoteConfigInstructions(pageConfigCollection)
  const pageConfigInstructions = Instructions.merge(
    inlineConfigInstructions,
    remoteConfigInstructions)
  const pageConfig = pageConfigInstructions.toConfig()
  silentLogger.table('page-config/remote-instructions', remoteConfigInstructions.getAll())
  silentLogger.log('page-config/merged-config', pageConfig)

  // Apply config
  applyConfig(pageConfig)
  silentLogger.warn('page-config/apply', 'THIS IS NOT IMPLEMENTED YET')

  // Get page slots
  const pageSlotsCollection = pageDatabase.get('PAGE_SLOTS')
  // [WIP] maybe split the getting of the slots first from
  // database then from inline data here rather than everything
  // done inside getPageSlotsMap (see WIP comment above getPageSlotsMap declaration)
  const pageSlotsMap = getPageSlotsMap(pageSlotsCollection)
  silentLogger.log('page-apps/slots-map', pageSlotsMap)
  
  // Render apps
  pageSlotsMap.forEach(async ({ name, options }, root) => {
    // [WIP] should handle adding .lm-app_init on root classes,
    // and erase the prerender.
    silentLogger.log('page-apps/render-init', { root, name, options })
    try {
      await renderApp({ name, options, root, pageConfig, silentLogger })
      silentLogger.log('page-apps/render-success', { root, name, options })
    } catch (err) {
      silentLogger.error('page-apps/rendered-failure', { root, name, options, err })
    }
  })
}
