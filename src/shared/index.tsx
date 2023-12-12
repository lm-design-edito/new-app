import appConfig from '~/config'
import { Apps } from '~/apps'
import { Analytics } from '~/shared/analytics'
import { Config } from '~/shared/config'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import getHeaderElements from '~/shared/get-header-element'
import { Globals, LmPage } from '~/shared/globals'
import { LmHtml } from '~/shared/lm-html'
import { Slots } from '~/shared/slots'
import absoluteModulo from '~/utils/absolute-modulo'
import arrayRandomPick from '~/utils/array-random-pick'
import bem from '~/utils/bem'
import * as Cast from '~/utils/cast'
import clamp from '~/utils/clamp'
import generateNiceColor from '~/utils/generate-nice-color'
import getCurrentDownlink from '~/utils/get-current-downlink'
import getNodeAncestors from '~/utils/get-node-ancestors'
import insertNode, { Position as InsertNodePosition } from '~/utils/insert-node'
import interpolate from '~/utils/interpolate'
import isArrayOf from '~/utils/is-array-of'
import isConstructorFunction from '~/utils/is-constructor-function'
import isFalsy from '~/utils/is-falsy'
import isInEnum from '~/utils/is-in-enum'
import isNullish from '~/utils/is-nullish'
import isRecord from '~/utils/is-record'
import isValidClassName from '~/utils/is-valid-css-class-name'
import memoize from '~/utils/memoize'
import randomUUID from '~/utils/random-uuid'
import recordFormat from '~/utils/record-format'
import replaceAll from '~/utils/replace-all'
import roundNumbers from '~/utils/round-numbers'
import selectorToElement from '~/utils/selector-to-element'
import Logger from '~/utils/silent-log'
import { debounce, throttle } from '~/utils/throttle-debounce'
import transition from '~/utils/transition'

/* * * * * * * * * * * * * * * * * * * * * *
 * EXPORT & GLOBALS
 * * * * * * * * * * * * * * * * * * * * * */
const meta: LmPage[Globals.GlobalKey.META] = {
  env: appConfig.env,
  built_on: appConfig.builtOn,
  built_on_readable: appConfig.builtOnReadable,
  version: appConfig.version,
  deployed_on: appConfig.deployedOn,
  deployed_on_readable: appConfig.deployedOnReadable,
  paths: appConfig.paths
}
const logger = new Logger()
const utils = {
  absoluteModulo,         arrayRandomPick,          bem,                    Cast,
  clamp,                  generateNiceColor,        getCurrentDownlink,     getNodeAncestors,          getHeaderElements,
  insertNode,             interpolate,              isArrayOf,              isConstructorFunction,     isFalsy,
  isInEnum,               isNullish,                isRecord,               isValidClassName,
  memoize,                randomUUID,               recordFormat,           replaceAll,                roundNumbers,
  selectorToElement,      throttle,                 debounce,               transition
}
Globals.expose(Globals.GlobalKey.META, meta)
Globals.expose(Globals.GlobalKey.ANALYTICS, Analytics)
Globals.expose(Globals.GlobalKey.APPS, Apps)
Globals.expose(Globals.GlobalKey.DARKDOUILLE, Darkdouille)
Globals.expose(Globals.GlobalKey.EVENTS, Events)
Globals.expose(Globals.GlobalKey.LM_HTML, LmHtml)
Globals.expose(Globals.GlobalKey.SLOTS, Slots)
Globals.expose(Globals.GlobalKey.LOGGER, logger)
Globals.expose(Globals.GlobalKey.INIT, init)
Globals.expose(Globals.GlobalKey.UTILS, utils)
export { meta, Analytics, Apps, Darkdouille, Events, LmHtml, Slots, Logger, logger, init, utils }

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT ON LOAD
 * * * * * * * * * * * * * * * * * * * * * */
const importUrl = new URL(import.meta.url)
const hasIdleParam = importUrl.searchParams.has('idle')
if (!hasIdleParam) autoInit()
async function autoInit () {
  const key = Globals.GlobalKey.HAS_AUTO_INIT
  const hasAlreadyAutoInit = Globals.retrieve(key) === true
  if (hasAlreadyAutoInit) return;
  Globals.expose(key, true)
  await init()
}

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
async function init () {
  logger.log('Page initialization',
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
  Slots.injectStyles('url', fontsStyles, { position: Slots.StylesPositions.GENERAL })
  document.head.append(fontsLinkElt)
  logger.log('Styles', '%cStylesheet injected', 'font-weight: 800;', fontsStyles)
  Slots.injectStyles('url', mainStyles, { position: Slots.StylesPositions.GENERAL })
  logger.log('Styles', '%cStylesheet injected', 'font-weight: 800;', mainStyles)
  
  /* INLINE CONFIG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Find, merge and evaluate inline page data
  const pageInlineDataNodes = document.body.querySelectorAll(appConfig.dataSourceSelector)
  const pageInlineDataNodesCopy = Array.from(pageInlineDataNodes).map(e => e.cloneNode(true)) as Element[]
  const pageInlineDataValue = Darkdouille.tree(Array.from(pageInlineDataNodes)).value
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
    const strName = Darkdouille.transformers.toString()(name)
    return Object
      .values(Config.InlineOnlyInstructionName)
      .includes(strName as any)
      ? { name: strName, value }
      : { name: '', value: undefined }
  }).filter(e => e.name !== '')

  // Load sources
  const pageInlineDataConfigSources = pageInlineDataConfigInstructions.filter((instruction): instruction is {
    name: Config.InlineOnlyInstructionName,
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
  const pageFullDataTree = Darkdouille.tree([...pageInlineDataNodesCopy, ...pageRemoteDataNodes])
  Globals.expose(Globals.GlobalKey.TREE, pageFullDataTree)
  const pageFullDataValue = pageFullDataTree.value
  logger.log('Full data', pageFullDataValue)
  const pageFullDataValueIsRecord = Darkdouille.valueIsRecord(pageFullDataValue)
  const pageDataSlotsCollectionName = appConfig.dataSourcesReservedNames.slots
  const pageFullDataConfig = pageFullDataValueIsRecord ? pageFullDataValue[pageDataConfigCollectionName] : undefined
  const pageFullDataSlots = pageFullDataValueIsRecord ? pageFullDataValue[pageDataSlotsCollectionName] : undefined

  // Apply config
  const pageFullDataConfigIsArray = Array.isArray(pageFullDataConfig)
  const pageFullDataRawConfig: Config.ConfigInstruction[] = pageFullDataConfigIsArray
    ? pageFullDataConfig.filter((instruction): instruction is Config.ConfigInstruction => {
      if (!Darkdouille.valueIsRecord(instruction)) return false
      const { name } = instruction
      const validInstructionsNames: string[] = [
        ...Object.values(Config.InlineOnlyInstructionName),
        ...Object.values(Config.RemoteInstructionName)
      ]
      return validInstructionsNames.includes(name as string)
    })
    : []
  Config.apply(pageFullDataRawConfig, logger)

  /* RENDER APPS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  
  const pageSlotsIsArray = Array.isArray(pageFullDataSlots)
  const pageSlotsArray = pageSlotsIsArray ? pageFullDataSlots : []
  await Promise.all(pageSlotsArray.map(async pageSlotData => {
    // Validate data shape
    if (!Darkdouille.valueIsRecord(pageSlotData)) return
    const { destination } = pageSlotData
    if (!Darkdouille.valueIsRecord(destination)) return
    const selector = Darkdouille.transformers.toString()(destination.selector)
    const position = destination.position !== undefined ? Darkdouille.transformers.toString()(destination.position) : undefined
    const reference = destination.reference !== undefined ? Darkdouille.transformers.toString()(destination.reference) : undefined
    // Create or select targets
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
      const clonedContent = content instanceof NodeList
        ? Array.from(content).map(node => node.cloneNode(true))
        : Darkdouille.transformers.toString()(content)
      const renderedContent = typeof clonedContent === 'string'
        ? clonedContent
        : await Promise.all(clonedContent.map(node => LmHtml.render(node)))
      Slots.makeSlot(targetElement, renderedContent)
    }))
  }))
  logger.log('Slots', '%cCreated slots:', 'font-weight: 800;', Slots.created)
  logger.log('Apps', '%cRendered apps:', 'font-weight: 800;', Apps.rendered)
}
