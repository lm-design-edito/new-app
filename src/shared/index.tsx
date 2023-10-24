import { render as preactRender } from 'preact'
import { expose, GlobalKey } from '~/shared/page-globals'
import { PageConfig } from '~/shared/page-config'
import renderLmHtml from '~/shared/lm-html'
import { Darkdouille } from '~/shared/darkdouille'
import Logger from '~/utils/silent-log'
import isArrayOf from '~/utils/is-array-of'
import selectorToElement from '~/utils/selector-to-element'
import appConfig from './config'

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

  // Load styles (dont await) [WIP] log when loaded ?
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
    const strName = Darkdouille.transformers.toString()(name)
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
  
  // Render in slots
  type SlotData = {
    selector: string | [string, string, string] // [target, position, reference]
    content: NodeListOf<Node>
  }
  const pageSlotsIsArray = Array.isArray(pageFullDataSlots)
  const pageSlotsRenderedMap = new Set<Element>()
  if (pageSlotsIsArray) {
    // Validate data
    const validSlots = pageFullDataSlots.filter((value): value is SlotData => {
      if (!Darkdouille.valueIsRecord(value)) return false
      const { selector, content } = value
      const selectorIsString = typeof selector === 'string'
      const selectorIsArrayOfStrings = isArrayOf(selector, String) && selector.length === 3
      if (!selectorIsString && !selectorIsArrayOfStrings) return false
      const contentIsNodeList = content instanceof NodeList
      const contentIsNodeListOfNodes = contentIsNodeList && isArrayOf([...content], Node)
      if (!contentIsNodeListOfNodes) return false
      return true
    })
    // Select/create render targets
    const withTargets = validSlots.map(slotData => {
      const { selector } = slotData
      if (typeof selector === 'string') {
        const targets = document.querySelectorAll(selector)
        return { ...slotData, targets: [...targets] }
      }
      const [actualSelector, position, reference] = selector
      const actualReferences = document.querySelectorAll(reference)
      const targets = [...actualReferences].map(actualRef => {
        const target = selectorToElement(actualSelector)
        if (position === 'after') {
          if (actualRef.nextSibling !== null) actualRef.parentNode?.insertBefore(target, target.nextSibling)
          else actualRef.parentNode?.appendChild(target)
        } else if (position === 'before') {
          actualRef.parentNode?.insertBefore(actualRef, target)
        } else if (position.replace(/(-|\s)/igm, '') === 'startof') {
          if (actualRef.firstChild !== null) actualRef.insertBefore(target, actualRef.firstChild)
          else actualRef.appendChild(target)
        } else if (position.replace(/(-|\s)/igm, 'endof')) {
          actualRef.appendChild(target)
        }
        return target
      })
      return { ...slotData, targets }
    })
    // Render in targets
    const renderedPromises = withTargets
      .map(async slotData => {
        return await Promise.all(slotData.targets.map(async target => {
          if (pageSlotsRenderedMap.has(target)) return {
            ...slotData,
            error: 'Something has already been rendered here.' as string,
          }
          const clonedContent = [...slotData.content].map(node => node.cloneNode(true))
          const renderedContent = await Promise.all(clonedContent.map(node => renderLmHtml(node, logger)))
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
      .flat()
    const rendered = await Promise.all(renderedPromises)
    logger.log('Render', rendered)
  }
}
