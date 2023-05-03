import { render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Scrllgngn, {
  LayoutName,
  Props,
  PropsBlockData,
  PropsPageData,
  PropsScrollBlockData,
  PropsStickyBlockData,
  TransitionDescriptor,
  TransitionName
} from '~/components/Scrllgngn'
import { toBoolean, toNumber, toString } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function ScrllgngnApp ({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Scrllgngn {...props} /> 
  render(app, root)
  silentLogger?.log(
    'scrllgngn-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
function optionsToProps (options: Options): Props {
  const props: Props = {}
  const {
    stickyBlocksLazyLoadDistance,
    stickyBlocksViewportHeight,
    stickyBlocksOffsetTop,
    thresholdOffset,
    bgColorTransitionDuration,
    pages,
    headerCustomClass,
    headerCustomCss,
    headerNavItemsAlign
  } = options
  // stickyBlocksLazyLoadDistance
  if (stickyBlocksLazyLoadDistance !== undefined) { props.stickyBlocksLazyLoadDistance = toNumber(stickyBlocksLazyLoadDistance) }
  // stickyBlocksViewportHeight
  if (stickyBlocksViewportHeight !== undefined) { props.stickyBlocksViewportHeight = toString(stickyBlocksViewportHeight) }
  // stickyBlocksOffsetTop
  if (stickyBlocksOffsetTop !== undefined) { props.stickyBlocksOffsetTop = toNumber(stickyBlocksOffsetTop) }
  // thresholdOffset
  if (thresholdOffset !== undefined) { props.thresholdOffset = toString(thresholdOffset) }
  // bgColorTransitionDuration
  if (typeof bgColorTransitionDuration === 'string') { props.bgColorTransitionDuration = bgColorTransitionDuration }
  else if (bgColorTransitionDuration !== undefined) { props.bgColorTransitionDuration = toNumber(bgColorTransitionDuration) }
  // pages
  if (Array.isArray(pages)) { props.pages = arrayToPages(pages) }
  // headerCustomClass
  if (headerCustomClass !== undefined) { props.headerCustomClass = toString(headerCustomClass) }
  // headerCustomCss
  if (headerCustomCss !== undefined) { props.headerCustomCss = toString(headerCustomCss) }
  // headerNavItemsAlign
  if (headerNavItemsAlign !== undefined) { props.headerNavItemsAlign = toString(headerNavItemsAlign) }
  return props
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO PAGES
 * * * * * * * * * * * * * * * * * * */
function arrayToPages (array: unknown[]): PropsPageData[] {
  const extractedPages: PropsPageData[] = []
  array.forEach((pageData: any) => {
    if (typeof pageData === 'object'
      && pageData !== null) {
      const extractedPage: PropsPageData = {}
      const {
        id,
        showHeader,
        showNav,
        headerLogoFill1,
        headerLogoFill2,
        headerCustomClass,
        headerCustomCss,
        headerNavItemsAlign,
        chapterName,
        isChapterHead,
        bgColor,
        blocks
      } = pageData
      // id
      if (id !== undefined) { extractedPage.id = toString(id) }
      // showHeader
      if (showHeader !== undefined) { extractedPage.showHeader = toBoolean(showHeader) }
      // showNav
      if (showNav !== undefined) { extractedPage.showNav = toBoolean(showNav) }
      // headerLogoFill1
      if (headerLogoFill1 !== undefined) { extractedPage.headerLogoFill1 = toString(headerLogoFill1) }
      // headerLogoFill2
      if (headerLogoFill2 !== undefined) { extractedPage.headerLogoFill2 = toString(headerLogoFill2) }
      // headerCustomClass
      if (headerCustomClass !== undefined) { extractedPage.headerCustomClass = toString(headerCustomClass) }
      // headerCustomCss
      if (headerCustomCss !== undefined) { extractedPage.headerCustomCss = toString(headerCustomCss) }
      // headerNavItemsAlign
      if (headerNavItemsAlign !== undefined) { extractedPage.headerNavItemsAlign = toString(headerNavItemsAlign) }
      // chapterName
      if (chapterName !== undefined) { extractedPage.chapterName = toString(chapterName) }
      // isChapterHead
      if (isChapterHead !== undefined) { extractedPage.isChapterHead = toBoolean(isChapterHead) }
      // bgColor
      if (bgColor !== undefined) { extractedPage.bgColor = toString(bgColor) }
      // blocks
      if (Array.isArray(blocks)) { extractedPage.blocks = arrayToBlocks(blocks) }
      extractedPages.push(extractedPage)
    }
  })
  return extractedPages
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO BLOCKS
 * * * * * * * * * * * * * * * * * * */
function arrayToBlocks (array: unknown[]): PropsBlockData[] {
  const extractedBlocks: PropsBlockData[] = []
  array.forEach((blockData: any) => {
    if (typeof blockData === 'object' && blockData !== null) {
      const {
        id,
        zIndex,
        type,
        content,
        trackScroll,
        depth,
        layout,
        mobileLayout,
        transitions,
        mobileTransitions
      } = blockData
      // depth?: 'scroll'
      if (depth === 'scroll' || depth === undefined) {
        const extractedScrollBlock: PropsScrollBlockData = {}
        extractedScrollBlock.depth = depth
        // id
        if (id !== undefined) { extractedScrollBlock.id = toString(id) }
        // zIndex
        if (zIndex !== undefined) { extractedScrollBlock.zIndex = toNumber(zIndex) }
        // type
        if (type === 'html' || type === 'module') { extractedScrollBlock.type = type }
        // content
        if (content !== undefined) { extractedScrollBlock.content = toString(content) }
        // trackScroll
        if (trackScroll !== undefined) { extractedScrollBlock.trackScroll = toBoolean(trackScroll) }
        // layout
        if (layout !== undefined) { extractedScrollBlock.layout = toString(layout) as LayoutName }
        // mobileLayout
        if (mobileLayout !== undefined) { extractedScrollBlock.mobileLayout = toString(mobileLayout) as LayoutName }
        extractedBlocks.push(extractedScrollBlock)
      
      // depth
      } else if (depth === 'front' || depth === 'back') {
        const extractedStickyBlock: PropsStickyBlockData = { depth: 'back' }
        extractedStickyBlock.depth = depth
        // id
        if (id !== undefined) { extractedStickyBlock.id = toString(id) }
        // zIndex
        if (zIndex !== undefined) { extractedStickyBlock.zIndex = toNumber(zIndex) }
        // type
        if (type === 'html' || type === 'module') { extractedStickyBlock.type = type }
        // content
        if (content !== undefined) { extractedStickyBlock.content = toString(content) }
        // trackScroll
        if (trackScroll !== undefined) { extractedStickyBlock.trackScroll = toBoolean(trackScroll) }
        // layout
        if (layout !== undefined) { extractedStickyBlock.layout = toString(layout) as LayoutName }
        // mobileLayout
        if (mobileLayout !== undefined) { extractedStickyBlock.mobileLayout = toString(mobileLayout) as LayoutName }
        // transitions
        if (Array.isArray(transitions)) {
          const extractedTransitions: TransitionDescriptor[] = []
          transitions.forEach(transitionDescriptor => {
            if (Array.isArray(transitionDescriptor)) {
              const [name, duration] = transitionDescriptor
              const nameIsValid = typeof name === 'string'
              const durationIsValid = typeof duration === 'string' || typeof duration === 'number'
              if (nameIsValid) {
                if (!durationIsValid) extractedTransitions.push([name as TransitionName])
                else extractedTransitions.push([name as TransitionName, duration])
              }
            }
          })
          extractedStickyBlock.transitions = extractedTransitions
        }
        // Mobile transitions
        if (Array.isArray(mobileTransitions)) {
          const extractedMobileTransitions: TransitionDescriptor[] = []
          mobileTransitions.forEach(transitionDescriptor => {
            if (Array.isArray(transitionDescriptor)) {
              const [name, duration] = transitionDescriptor
              const nameIsValid = typeof name === 'string'
              const durationIsValid = typeof duration === 'string' || typeof duration === 'number'
              if (nameIsValid) {
                if (!durationIsValid) extractedMobileTransitions.push([name as TransitionName])
                else extractedMobileTransitions.push([name as TransitionName, duration])
              }
            }
          })
          extractedStickyBlock.mobileTransitions = extractedMobileTransitions
        }
        extractedBlocks.push(extractedStickyBlock)
      }
    }
  })
  return extractedBlocks
}
