import { injectDefaultStyles } from '../../utils/lm-page-styles'
import {
  getInlineConfigInstructrions,
  getRemoteConfigInstructions,
  Instructions
} from '../../utils/lm-page-config'
import {
  makePageDatabase,
  filterPageDatabase
} from '../../utils/lm-page-database'

/* * * * * * * * * * * * * * * * * * * * * *
 * URLS
 * * * * * * * * * * * * * * * * * * * * * */
export const ROOT_URL = new URL('../../', import.meta.url)            // ROOT
export const SHARED_URL = new URL('shared/', ROOT_URL)                // shared/
export const ASSETS_URL = new URL('assets/', SHARED_URL)              // assets/
export const FONTS_URL = new URL('fonts/', SHARED_URL)                // fonts/
export const SCRIPTS_URL = new URL('scripts/', SHARED_URL)            // scripts/
export const SCRIPTS_INDEX_URL = new URL(import.meta.url)             // scripts/index.js
export const STYLES_URL = new URL('styles/', SHARED_URL)              // styles/
export const STYLES_INDEX_URL = new URL('index.css', STYLES_URL)      // styles/index.css

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
const searchParams = new URLSearchParams(SCRIPTS_INDEX_URL.search)
const shouldntInit = searchParams.has('noInit')
if (!shouldntInit) initPage()
export async function initPage () {
  // Load styles (dont await)
  injectDefaultStyles()

  // Read inline config
  const inlineConfigInstructions = getInlineConfigInstructrions()
  const inlinePageConfig = inlineConfigInstructions.toConfig()

  // Load & filter data sources
  const inlineDataSources = inlinePageConfig.dataSources
  const unfilteredPageDatabase = await makePageDatabase(inlineDataSources)
  const pageDatabase = inlinePageConfig.id !== undefined
    ? filterPageDatabase(unfilteredPageDatabase.clone(), inlinePageConfig.id)
    : unfilteredPageDatabase

  // Merge remote configs
  const pageConfigCollection = pageDatabase.get('PAGE_CONFIG')
  const remoteConfigInstructions = getRemoteConfigInstructions(pageConfigCollection)
  const pageConfigInstructions = Instructions.merge(
    inlineConfigInstructions,
    remoteConfigInstructions
  )
  console.log('pageConfig', pageConfigInstructions.toConfig())
  console.log('pageDatabase', pageDatabase)
}
