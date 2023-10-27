import { render as preactRender } from 'preact'
import appConfig from '~/config'
import { Globals } from '~/shared/globals'
import { Config } from '~/shared/config'
import { LmHtml } from '~/shared/lm-html'
import { Darkdouille } from '~/shared/darkdouille'
import Logger from '~/utils/silent-log'
import isArrayOf from '~/utils/is-array-of'
import isRecord from '~/utils/is-record'
import selectorToElement from '~/utils/selector-to-element'
import { injectStylesheet } from '~/utils/dynamic-css'

/* * * * * * * * * * * * * * * * * * * * * *
 * SILENT LOGGER & GLOBALS
 * * * * * * * * * * * * * * * * * * * * * */
const logger = new Logger()
Globals.expose(Globals.GlobalKey.SILENT_LOGGER, logger)
Globals.expose(Globals.GlobalKey.ENV, appConfig.env)
if (appConfig.env === 'developpment') {
  Globals.expose(Globals.GlobalKey.VERSION, 'dev')
  Globals.expose(Globals.GlobalKey.TARGET, 'localhost')
  Globals.expose(Globals.GlobalKey.BUILD_TIME, undefined)
}

/* * * * * * * * * * * * * * * * * * * * * *
 * INIT
 * * * * * * * * * * * * * * * * * * * * * */
const searchParams = new URLSearchParams(appConfig.paths.SCRIPTS_INDEX_URL.search)
const shouldntInit = searchParams.has('noInit')
if (!shouldntInit) initPage()

export async function initPage () {
  logger.log('Page initialization',
    '%cStart init', 'font-weight: 800;',
    '\nenv:', Globals.retrieve(Globals.GlobalKey.ENV),
    '\nversion:', Globals.retrieve(Globals.GlobalKey.VERSION),
    '\ntarget:', Globals.retrieve(Globals.GlobalKey.TARGET),
    '\nbuild time:', Globals.retrieve(Globals.GlobalKey.BUILD_TIME),
    '\nscript url:', appConfig.paths.SCRIPTS_INDEX_URL.toString())

  /* STYLES * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  // Keep lm-page-stylesheet elements at the end of the body
  // [WIP] find something better after Adaptation
  const lmPageStylesheets = [...document.querySelectorAll('link[href^="https://assets-decodeurs.lemonde.fr/redacweb"]')]
  document.body.append(...lmPageStylesheets.map(node => node.cloneNode()))
  lmPageStylesheets.forEach(stylesheetNode => stylesheetNode.remove())

  // Load styles
  const mainStyles = appConfig.paths.STYLES_INDEX_URL.toString()
  const devStyles = appConfig.paths.STYLES_DEV_URL.toString()
  injectStylesheet(mainStyles, () => logger.log('Styles', '%cStylesheet loaded', 'font-weight: 800;', mainStyles))
  if (appConfig.env === 'developpment') injectStylesheet(devStyles, () => logger.log('Styles', '%cStylesheet loaded', 'font-weight: 800;', devStyles))

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
  const pageFullDataTree = Darkdouille.tree(...pageInlineDataNodesCopy, ...pageRemoteDataNodes)
  Globals.expose(Globals.GlobalKey.DATA_TREE, pageFullDataTree)
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
  
  type SlotData = {
    content: NodeListOf<Node>
    destination: {
      selector: string
      position?: string
      reference?: string
    }
  }
  const pageSlotsIsArray = Array.isArray(pageFullDataSlots)
  const pageSlotsArray = pageSlotsIsArray ? pageFullDataSlots : []
  const pageSlotsRenderedMap = new Set<Element>()
  
  // Validate data
  const validSlots = pageSlotsArray.filter((value): value is SlotData => {
    if (!Darkdouille.valueIsRecord(value)) return false
    const { destination, content } = value
    if (!isRecord(destination)) return false;
    if (typeof destination.selector !== 'string') return false
    if (typeof destination.position !== 'string' && destination.position !== undefined) return false
    if (typeof destination.reference !== 'string' && destination.reference !== undefined) return false
    const contentIsNodeList = content instanceof NodeList
    const contentIsNodeListOfNodes = contentIsNodeList && isArrayOf([...content], Node)
    if (!contentIsNodeListOfNodes) return false
    return true
  })
  logger.log('Slots', '%cData', 'font-weight: 800;', validSlots)
  
  // Select/create render targets
  const withTargets = validSlots.map(slotData => {
    const { destination } = slotData
    const { selector, position, reference } = destination
    if (position === undefined || reference === undefined) {
      const targetElements = document.querySelectorAll(selector)
      if (targetElements.length === 0) logger.warn('Slots', `No target matching selector ${selector}`)
      return { ...slotData, targetElements: [...targetElements] }
    }
    const referenceElements = document.querySelectorAll(reference)
    const targetElements = [...referenceElements].map(refElement => {
      const targetElement = selectorToElement(selector)
      if (position === 'after') {
        if (refElement.nextSibling !== null) refElement.parentNode?.insertBefore(targetElement, targetElement.nextSibling)
        else refElement.parentNode?.appendChild(targetElement)
      } else if (position === 'before') {
        refElement.parentNode?.insertBefore(refElement, targetElement)
      } else if (position.replace(/(-|\s)/igm, '') === 'startof') {
        if (refElement.firstChild !== null) refElement.insertBefore(targetElement, refElement.firstChild)
        else refElement.appendChild(targetElement)
      } else if (position.replace(/(-|\s)/igm, 'endof')) {
        refElement.appendChild(targetElement)
      }
      logger.log('Slots', '%cCreated', 'font-weight: 800;', targetElement, `with position '${position}'`, 'from', refElement)
      return targetElement
    })
    return { ...slotData, targetElements }
  })
  
  // Render in targets
  const renderedPromises = withTargets
    .map(async slotData => {
      return await Promise.all(slotData.targetElements.map(async target => {
        if (pageSlotsRenderedMap.has(target)) return {
          ...slotData,
          error: 'Something has already been rendered here.' as string,
        }
        const clonedContent = [...slotData.content].map(node => node.cloneNode(true))
        const renderedContent = await Promise.all(clonedContent.map(node => LmHtml.render(node, logger)))
        target.innerHTML = ''
        preactRender(<>{renderedContent}</>, target)
        pageSlotsRenderedMap.add(target)
        return {
          ...slotData,
          content: clonedContent,
          rendered: renderedContent
        }
      }))
    })
  const rendered = (await Promise.all(renderedPromises)).flat()
  logger.log('Slots', '%cRendered content in slots:', 'font-weight: 800;', rendered)
}
