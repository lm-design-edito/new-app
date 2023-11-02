import { Apps } from 'apps'
import { Events } from '~/shared/events'
import { Globals } from '~/shared/globals'
import Logger from '~/utils/silent-log'
import { toString, toNumber, toBoolean } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Scrollgneugneu, {
  Props,
  PropsPageData,
  PropsBlockData,
  PropsScrollBlockData,
  PropsStickyBlockData,
  LayoutName,
  TransitionDescriptor,
  isTransitionName,
  State
} from '~/components/Scrllgngn'

export default async function renderer (
  unknownProps: unknown,
  id: string,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Scrollgneugneu }
}

async function toProps (
  input: unknown,
  id: string,
  logger?: Logger
): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = {}
  const {
    customClass,
    stickyBlocksLazyLoadDistance,
    stickyBlocksViewportHeight,
    stickyBlocksOffsetTop,
    forceStickBlocks,
    thresholdOffset,
    bgColorTransitionDuration,
    pages,
    onPageChange
  } = input
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (stickyBlocksLazyLoadDistance !== undefined) { props.stickyBlocksLazyLoadDistance = toNumber(stickyBlocksLazyLoadDistance) }
  if (stickyBlocksViewportHeight !== undefined) { props.stickyBlocksViewportHeight = toString(stickyBlocksViewportHeight) }
  if (forceStickBlocks !== undefined) {
    const strForceStickBlocks = toString(forceStickBlocks)
    if (strForceStickBlocks === 'before'
      || strForceStickBlocks === 'after'
      || strForceStickBlocks === 'both') {
      props.forceStickBlocks = strForceStickBlocks
    }
  }
  if (stickyBlocksOffsetTop !== undefined) { props.stickyBlocksOffsetTop = toNumber(stickyBlocksOffsetTop) }
  if (thresholdOffset !== undefined) { props.thresholdOffset = toString(thresholdOffset) }
  if (typeof bgColorTransitionDuration === 'string') { props.bgColorTransitionDuration = bgColorTransitionDuration }
  else if (bgColorTransitionDuration !== undefined) { props.bgColorTransitionDuration = toNumber(bgColorTransitionDuration) }
  if (Array.isArray(pages)) { props.pages = await arrayToPages(pages, logger) }
  if (Array.isArray(onPageChange)) {
    props.onPageChange = async (state?: State) => {
      for (const handler of onPageChange) {
        const strHandlerName = toString(handler)
        const foundHandler = Events.getRegisteredHandler(strHandlerName)
        if (foundHandler !== undefined) await foundHandler({
          details: state,
          type: Events.Type.SCRLLGNGN_ON_PAGE_CHANGE,
          initiatorId: id,
          globals: Globals.globalObj
        })
        else () => { console.error(`No handler found with name`, strHandlerName) }
      }
    }
  }
  return props
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO PAGES
 * * * * * * * * * * * * * * * * * * */
async function arrayToPages (
  array: unknown[],
  logger?: Logger
): Promise<PropsPageData[]> {
  const extractedPages: PropsPageData[] = []
  for (const pageData of array) {
    if (!isRecord(pageData)) continue
    const extractedPage: PropsPageData = {}
    const { id, bgColor, blocks } = pageData
    if (id !== undefined) { extractedPage.id = toString(id) }
    if (bgColor !== undefined) { extractedPage.bgColor = toString(bgColor) }
    if (Array.isArray(blocks)) { extractedPage.blocks = await arrayToBlocks(blocks, logger) }
    extractedPages.push(extractedPage)
  }
  return extractedPages
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO BLOCKS
 * * * * * * * * * * * * * * * * * * */
async function arrayToBlocks (
  array: unknown[],
  logger?: Logger
): Promise<PropsBlockData[]> {
  const extractedBlocks: PropsBlockData[] = []
  for (const blockData of array) {
    if (!isRecord(blockData)) continue
    const {
      id, zIndex, type, content, trackScroll, depth, layout,
      mobileLayout, transitions, mobileTransitions
    } = blockData
    
    // depth?: 'scroll'
    if (depth === 'scroll' || depth === undefined) {
      const extractedScrollBlock: PropsScrollBlockData = {}
      extractedScrollBlock.depth = depth
      if (id !== undefined) { extractedScrollBlock.id = toString(id) }
      if (zIndex !== undefined) { extractedScrollBlock.zIndex = toNumber(zIndex) }
      if (type === 'html' || type === 'module') { extractedScrollBlock.type = type }
      if (content !== undefined) {
        if (type === 'module') { extractedScrollBlock.content = toString(content) }
        else { extractedScrollBlock.content = await Apps.toStringOrVNodeHelper(content, logger) }
      }
      if (trackScroll !== undefined) { extractedScrollBlock.trackScroll = toBoolean(trackScroll) }
      if (layout !== undefined) { extractedScrollBlock.layout = toString(layout) as LayoutName }
      if (mobileLayout !== undefined) { extractedScrollBlock.mobileLayout = toString(mobileLayout) as LayoutName }
      extractedBlocks.push(extractedScrollBlock)
    
    // depth: 'front'|'back'
    } else if (depth === 'front' || depth === 'back') {
      const extractedStickyBlock: PropsStickyBlockData = { depth: 'back' }
      extractedStickyBlock.depth = depth
      if (id !== undefined) { extractedStickyBlock.id = toString(id) }
      if (zIndex !== undefined) { extractedStickyBlock.zIndex = toNumber(zIndex) }
      if (type === 'html' || type === 'module') { extractedStickyBlock.type = type }
      if (content !== undefined) {
        if (type === 'module') { extractedStickyBlock.content = toString(content) }
        else { extractedStickyBlock.content = await Apps.toStringOrVNodeHelper(content, logger) }
      }
      if (trackScroll !== undefined) { extractedStickyBlock.trackScroll = toBoolean(trackScroll) }
      if (layout !== undefined) { extractedStickyBlock.layout = toString(layout) as LayoutName }
      if (mobileLayout !== undefined) { extractedStickyBlock.mobileLayout = toString(mobileLayout) as LayoutName }
      if (Array.isArray(transitions)) {
        const transitionsArr: TransitionDescriptor[] = []
        transitions.forEach((transitionObj: unknown) => {
          if (!Array.isArray(transitionObj)) return;
          const [name, duration] = transitionObj
          const strName = toString(name)
          if (!isTransitionName(strName)) return;
          if (typeof duration === 'string' || typeof duration === 'number') transitionsArr.push([name, duration])
          else transitionsArr.push([name])
        })
        extractedStickyBlock.transitions = transitionsArr
      }
      if (Array.isArray(mobileTransitions)) {
        const mobileTransitionsArr: TransitionDescriptor[] = []
        mobileTransitions.forEach((transitionObj: unknown) => {
          if (!Array.isArray(transitionObj)) return;
          const [name, duration] = transitionObj
          const strName = toString(name)
          if (!isTransitionName(strName)) return;
          if (typeof duration === 'string' || typeof duration === 'number') mobileTransitionsArr.push([name, duration])
          else mobileTransitionsArr.push([name])
        })
        extractedStickyBlock.mobileTransitions = mobileTransitionsArr
      }
      extractedBlocks.push(extractedStickyBlock)
    }
  }
  return extractedBlocks
}
