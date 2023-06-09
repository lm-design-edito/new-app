import { getInlineConfigInstructrions, getRemoteConfigInstructions, applyConfig, Instructions } from '~/shared/lm-page-config'
import { makePageDatabase, filterPageDatabase } from '~/shared/lm-page-database'
import { getPageSlotsMap, renderApp } from '~/shared/lm-page-apps'
import { expose, GlobalKey } from '~/shared/lm-page-globals'
import flattenGetters from '~/utils/flatten-getters'
import Logger from '~/utils/silent-log'
import appConfig from './config'

const {
  SCRIPTS_INDEX_URL,
  STYLES_INDEX_URL,
  STYLES_DEV_URL
} = appConfig.paths
const { databaseReservedNames } = appConfig

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

  // Keep lm-page-stylesheet elements at the end of the head
  // const headNode = document.head
  // let headNodeLastMutatedStylesheetNodes: Node[] = []
  // const headObserver = new MutationObserver(mutationList => {
  //   const onlyStylesheetsMutated = mutationList.every(({ addedNodes, removedNodes }) => {
  //     const nodes = [...addedNodes, ...removedNodes]
  //     return nodes.every(node => headNodeLastMutatedStylesheetNodes.includes(node))
  //   })
  //   if (onlyStylesheetsMutated) return;
  //   const lmPageStylesheets = [...document.querySelectorAll('.lm-page-stylesheet')]
  //   headNodeLastMutatedStylesheetNodes = [...lmPageStylesheets]
  //   lmPageStylesheets.forEach(stylesheet => headNode.appendChild(stylesheet))
  // })
  // headObserver.observe(headNode, { childList: true })
  
  // [WIP] find something better after Adaptation
  const lmPageStylesheets = [...document.querySelectorAll('link[href^="https://assets-decodeurs.lemonde.fr/redacweb"]')]
  document.body.append(...lmPageStylesheets)
  
  // Load styles (dont await)
  document.head.innerHTML += `<link rel="stylesheet" href="${STYLES_INDEX_URL.toString()}">`
  if (process.env.NODE_ENV === 'developpment') {
    document.head.innerHTML += `<link rel="stylesheet" href="${STYLES_DEV_URL.toString()}">`
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
  const pageConfigCollection = pageDatabase.get(databaseReservedNames.config)
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
  const pageSlotsCollection = pageDatabase.get(databaseReservedNames.slots)
  const pageSlotsMap = getPageSlotsMap(pageSlotsCollection) // [WIP] maybe split this
  silentLogger.log('page-apps/slots-map', pageSlotsMap)
  
  // Render apps
  silentLogger.log('page-apps/rendering', 'Starting apps rendering.')
  pageSlotsMap.forEach(async ({ name, options }, root) => {
    try { await renderApp({ name, options, root, pageConfig, silentLogger }) }
    catch (err) { silentLogger.error('page-apps/rendering-failure', { root, name, options, err }) }
  })
}
