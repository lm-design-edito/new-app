import { HyperJson } from '@design-edito/tools/agnostic/html/hyper-json'
import appConfig from '~/config'
import { Apps } from '~/apps'
import { Analytics } from '~/shared/analytics'
import { Config } from '~/shared/config'
import { Events } from '~/shared/events'
import { Externals } from '~/shared/externals'
import { Globals } from '~/shared/globals'
import { LmHtml } from '~/shared/lm-html'
import { Slots } from '~/shared/slots'
import { insertNode, InsertNodePosition } from '@design-edito/tools/agnostic/html/insert-node'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { selectorToElement } from '@design-edito/tools/agnostic/html/selector-to-element'
import { Logger } from '@design-edito/tools/agnostic/misc/logs/logger'

/* * * * * * * * * * * * * * * * * * * * * *
 * EXPORT & GLOBALS
 * * * * * * * * * * * * * * * * * * * * * */
const meta: Globals.GlobalObj[Globals.GlobalKey.META] = {
  env: appConfig.env,
  built_on: appConfig.builtOn,
  built_on_readable: appConfig.builtOnReadable,
  version: appConfig.version,
  deployed_on: appConfig.deployedOn,
  deployed_on_readable: appConfig.deployedOnReadable,
  paths: appConfig.paths
}
const logger = new Logger()
Globals.expose(Globals.GlobalKey.META, meta)
Globals.expose(Globals.GlobalKey.ANALYTICS, Analytics)
Globals.expose(Globals.GlobalKey.APPS, Apps)
Globals.expose(Globals.GlobalKey.CONFIG, Config)
Globals.expose(Globals.GlobalKey.EVENTS, Events)
Globals.expose(Globals.GlobalKey.EXTERNALS, Externals)
Globals.expose(Globals.GlobalKey.LM_HTML, LmHtml)
Globals.expose(Globals.GlobalKey.SLOTS, Slots)
Globals.expose(Globals.GlobalKey.LOGGER, logger as unknown as Logger)
Globals.expose(Globals.GlobalKey.INIT, init)
export { meta, Analytics, Apps, Config, Events, Externals, LmHtml, Slots, Logger, logger, init }

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT ON LOAD
 * * * * * * * * * * * * * * * * * * * * * */
const importUrl = new URL(import.meta.url)
const hasIdleParam = importUrl.searchParams.has('idle')
if (!hasIdleParam) autoInit()
async function autoInit () {
  const key = Globals.GlobalKey.HAS_AUTO_INITED
  const hasAlreadyAutoInit = Globals.retrieve(key) === true
  if (hasAlreadyAutoInit) return;
  Globals.expose(key, true)
  await init()
}

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
async function init () {
  logger.log('Init',
    '%cStart init', 'font-weight: 800;',
    '\nenv:', appConfig.env,
    '\nport:', appConfig.port,
    '\nbuiltOn:', appConfig.builtOn,
    '\nbuiltOnReadable:', appConfig.builtOnReadable,
    '\nversion:', appConfig.version,
    '\ndeployedOn:', appConfig.deployedOn,
    '\ndeployedOnReadable:', appConfig.deployedOnReadable,
    '\npaths:', appConfig.paths,
    '\nscript url:', appConfig.paths.SCRIPTS_INDEX_URL.toString())

  /* STYLES * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Keep lm-page-stylesheet elements at the end of the body
  // [WIP] find something better after Adaptation
  const lmPageStylesheets = Array.from(document.querySelectorAll('link[href^="https://assets-decodeurs.lemonde.fr/redacweb"]'))
  document.body.append(...lmPageStylesheets.map(node => node.cloneNode()))
  lmPageStylesheets.forEach(stylesheetNode => stylesheetNode.remove())

  // Load styles
  const fontsStyles = appConfig.paths.STYLES_FONTS_URL.toString()
  const mainStyles = appConfig.paths.STYLES_INDEX_URL.toString()
  const fontsLinkElt = document.createElement('link')
  fontsLinkElt.setAttribute('rel', 'stylesheet')
  fontsLinkElt.setAttribute('href', fontsStyles)
  Slots.injectStyles('url', fontsStyles, { name: 'lm-page-main-fonts', position: Slots.StylePosition.HEAD })
  logger.log('Styles', '%cStylesheet injected', 'font-weight: 800;', fontsStyles)
  Slots.injectStyles('url', mainStyles, { name: 'lm-page-main-styles', position: Slots.StylePosition.STRUCTURAL })
  logger.log('Styles', '%cStylesheet injected', 'font-weight: 800;', mainStyles)
  
  /* INLINE CONFIG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Find, merge and evaluate inline page data
  const getPageInlineDataElements = () => {
    const nodes = document.querySelectorAll(appConfig.dataSourceSelector)
    return Array.from(nodes).map(e => e.cloneNode(true)) as Element[]
  }
  const pageInlineDataValue = HyperJson.Tree.from(
    getPageInlineDataElements(),
    { rootKey: appConfig.dataSourceRootKey }
  ).evaluate()
  logger.log('Inline data', pageInlineDataValue)
  const pageInlineDataValueIsRecord = isRecord(pageInlineDataValue)
  const pageDataConfigCollectionName = appConfig.dataSourcesReservedNames.config
  const pageInlineDataRawConfigInstructions = pageInlineDataValueIsRecord
    && Array.isArray(pageInlineDataValue[pageDataConfigCollectionName])
    ? pageInlineDataValue[pageDataConfigCollectionName] as HyperJson.Types.Value[]
    : []
  const pageInlineDataConfigInstructions = pageInlineDataRawConfigInstructions.map(instruction => {
    const instructionIsRecord = isRecord(instruction)
    if (!instructionIsRecord) return { name: '', value: undefined }
    const { name, value } = instruction
    const strName = HyperJson.Cast.toString(name ?? '')
    return Object
      .values(Config.InlineOnlyInstructionName)
      .includes(strName as any)
      ? { name: strName, value }
      : { name: '', value: undefined }
  }).filter(e => e.name !== '')

  // [WIP] Before remote files load, could apply some config stuff already ?

  // Load sources
  const pageInlineDataConfigSources = pageInlineDataConfigInstructions.filter((instruction): instruction is {
    name: Config.InlineOnlyInstructionName.SOURCE,
    value: string
  } => {
    const { name, value } = instruction
    const { SOURCE } = Config.InlineOnlyInstructionName
    return name === SOURCE && typeof value === 'string'
  })
  logger.log('Remote sources', '%cURLS', 'font-weight: 800;', `\n${pageInlineDataConfigSources.map(e => e.value).join('\n').trim()}`)
  const pageInlineDataConfigSourcesPromises = pageInlineDataConfigSources.map(async ({ value }) => {
    try {
      const res = await window.fetch(value)
      if (res.ok) {
        logger.log('Remote sources', '%cLOADED', 'font-weight: 800;', `\n${value}`, res)
        return await res.text()
      }
      throw new Error(res.statusText)
    } catch (err) {
      logger.error('Remote sources', '%cERROR', 'font-weight: 800;', `\n${value}`, err)
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
  const pageFullDataTree = HyperJson.Tree.from([
    ...getPageInlineDataElements(),
    ...pageRemoteDataNodes
  ], { rootKey: appConfig.dataSourceRootKey })
  Globals.expose(Globals.GlobalKey.TREE, pageFullDataTree)
  const pageFullDataValue = pageFullDataTree.evaluate()
  logger.log('Full data', pageFullDataValue)
  const pageFullDataValueIsRecord = isRecord(pageFullDataValue)
  const pageDataSlotsCollectionName = appConfig.dataSourcesReservedNames.slots
  const pageFullDataConfig = pageFullDataValueIsRecord ? pageFullDataValue[pageDataConfigCollectionName] : undefined
  const pageFullDataSlots = pageFullDataValueIsRecord ? pageFullDataValue[pageDataSlotsCollectionName] : undefined

  // Apply config
  const pageFullDataConfigIsArray = Array.isArray(pageFullDataConfig)
  const pageFullDataRawConfig: Config.ConfigInstruction[] = pageFullDataConfigIsArray
    ? pageFullDataConfig.filter((instruction): instruction is Config.ConfigInstruction => {
      if (!isRecord(instruction)) return false
      const { name } = instruction
      const validInstructionsNames: string[] = [
        ...Object.values(Config.InlineOnlyInstructionName),
        ...Object.values(Config.RemoteInstructionName)
      ]
      return validInstructionsNames.includes(name as string)
    })
    : []
  // [WIP] Maybe await ? Maybe dont await but Config.apply should return a promise ?
  // Maybe it only has promises like stylesInjected, stylesLoaded, handlersFileLoaded, trackingEventListenersAdded, etc... ?
  Config.apply(pageFullDataRawConfig)

  /* RENDER APPS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  
  const pageSlotsIsArray = Array.isArray(pageFullDataSlots)
  const pageSlotsArray = pageSlotsIsArray ? pageFullDataSlots : []
  await Promise.all(pageSlotsArray.map(async pageSlotData => {
    // Validate data shape
    if (!isRecord(pageSlotData)) return
    const { destination } = pageSlotData
    if (!isRecord(destination)) return
    const selector = destination.selector !== undefined ? HyperJson.Cast.toString(destination.selector) : undefined
    if (selector === undefined) return
    const position = destination.position !== undefined ? HyperJson.Cast.toString(destination.position) : undefined
    const reference = destination.reference !== undefined ? HyperJson.Cast.toString(destination.reference) : undefined
    // Create or select targets
    // [WIP] Maybe slots creation should be inside Slots
    const targetElements: Element[] = []
    if (position === undefined || reference === undefined) targetElements.push(...document.querySelectorAll(selector))
    else {
      const cleanPosition = position.trim().replace(/(-|\s)/igm, '') as InsertNodePosition
      const targetElement = selectorToElement(selector)
      const referenceElements = document.querySelectorAll(reference)
      Array.from(referenceElements).forEach(referenceElement => {
        const clonedTarget = targetElement.cloneNode(true) as HTMLElement
        insertNode(clonedTarget, cleanPosition, referenceElement)
        targetElements.push(clonedTarget)
      })
    }
    // Inject content inside targets
    await Promise.all(targetElements.map(async targetElement => {
      const { content } = pageSlotData
      let actualContent: Element | Text | NodeList | string
      if (content instanceof Element) { actualContent = content }
      else if (content instanceof Text) { actualContent = content }
      else if (content instanceof NodeList) { actualContent = content }
      else { actualContent = HyperJson.Cast.toString(content ?? '') }
      const rendered = typeof actualContent === 'string'
        ? actualContent
        : await LmHtml.render(actualContent)
      Slots.makeSlot(targetElement, rendered)
      // const { content } = pageSlotData
      // const clonedContent = content instanceof NodeList
      //   ? Array.from(content).map(node => node.cloneNode(true))
      //   : HyperJson.Cast.toString(content ?? '')
      // const renderedContent = typeof clonedContent === 'string'
      //   ? clonedContent
      //   : await Promise.all(clonedContent.map(node => LmHtml.render(node)))
      // Slots.makeSlot(targetElement, renderedContent)
    }))
  }))
  logger.log('Slots', '%cCreated slots:', 'font-weight: 800;', Slots.created)
  logger.log('Apps', '%cRendered apps:', 'font-weight: 800;', Apps.rendered)
}
