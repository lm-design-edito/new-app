import { render } from 'preact'
import { Options, Renderer } from '~/shared-utils/lm-page-apps'
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
  silentLogger?.log('scrllgngn-app/rendered', props, root)
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
  if (typeof stickyBlocksLazyLoadDistance === 'number') { props.stickyBlocksLazyLoadDistance = stickyBlocksLazyLoadDistance }
  if (typeof stickyBlocksLazyLoadDistance === 'string') { props.stickyBlocksLazyLoadDistance = window.parseInt(stickyBlocksLazyLoadDistance) }
  // stickyBlocksViewportHeight
  if (typeof stickyBlocksViewportHeight === 'string') { props.stickyBlocksViewportHeight = stickyBlocksViewportHeight }
  // stickyBlocksOffsetTop
  if (typeof stickyBlocksOffsetTop === 'number') { props.stickyBlocksOffsetTop = stickyBlocksOffsetTop }
  if (typeof stickyBlocksOffsetTop === 'string') { props.stickyBlocksOffsetTop = window.parseInt(stickyBlocksOffsetTop) }
  // thresholdOffset
  if (typeof thresholdOffset === 'string') { props.thresholdOffset = thresholdOffset }
  // bgColorTransitionDuration
  if (typeof bgColorTransitionDuration === 'number') { props.bgColorTransitionDuration = bgColorTransitionDuration }
  if (typeof bgColorTransitionDuration === 'string') { props.bgColorTransitionDuration = bgColorTransitionDuration }
  // pages
  console.log((pages as any[])[0])
  if (Array.isArray(pages)) { props.pages = arrayToPages(pages) }
  // headerCustomClass
  if (typeof headerCustomClass === 'string') { props.headerCustomClass = headerCustomClass }
  // headerCustomCss
  if (typeof headerCustomCss === 'string') { props.headerCustomCss = headerCustomCss }
  // headerNavItemsAlign
  if (typeof headerNavItemsAlign === 'string') { props.headerNavItemsAlign = headerNavItemsAlign }

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
      if (typeof id === 'string') { extractedPage.id = id }
      // showHeader
      if (typeof showHeader === 'boolean') { extractedPage.showHeader = showHeader }
      // showNav
      if (typeof showNav === 'boolean') { extractedPage.showNav = showNav }
      // headerLogoFill1
      if (typeof headerLogoFill1 === 'string') { extractedPage.headerLogoFill1 = headerLogoFill1 }
      // headerLogoFill2
      if (typeof headerLogoFill2 === 'string') { extractedPage.headerLogoFill2 = headerLogoFill2 }
      // headerCustomClass
      if (typeof headerCustomClass === 'string') { extractedPage.headerCustomClass = headerCustomClass }
      // headerCustomCss
      if (typeof headerCustomCss === 'string') { extractedPage.headerCustomCss = headerCustomCss }
      // headerNavItemsAlign
      if (typeof headerNavItemsAlign === 'string') { extractedPage.headerNavItemsAlign = headerNavItemsAlign }
      // chapterName
      if (typeof chapterName === 'string') { extractedPage.chapterName = chapterName }
      // isChapterHead
      if (typeof isChapterHead === 'boolean') { extractedPage.isChapterHead = isChapterHead }
      // bgColor
      if (typeof bgColor === 'string') { extractedPage.bgColor = bgColor }
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
      if (depth === 'scroll' || depth === undefined) {
        const extractedScrollBlock: PropsScrollBlockData = {}
        extractedScrollBlock.depth = depth
        if (typeof id === 'string') { extractedScrollBlock.id = id }
        if (typeof zIndex === 'string') { extractedScrollBlock.zIndex = parseInt(zIndex) }
        if (typeof zIndex === 'number') { extractedScrollBlock.zIndex = zIndex }
        if (type === 'html' || type === 'module') { extractedScrollBlock.type = type }
        if (typeof content === 'string') { extractedScrollBlock.content = content }
        if (typeof trackScroll === 'boolean') { extractedScrollBlock.trackScroll = trackScroll }
        if (typeof layout === 'string') { extractedScrollBlock.layout = layout as LayoutName }
        if (typeof mobileLayout === 'string') { extractedScrollBlock.mobileLayout = mobileLayout as LayoutName }
        extractedBlocks.push(extractedScrollBlock)
      
      } else if (depth === 'front' || depth === 'back') {
        const extractedStickyBlock: PropsStickyBlockData = { depth: 'back' }
        extractedStickyBlock.depth = depth
        if (typeof id === 'string') { extractedStickyBlock.id = id }
        if (typeof zIndex === 'string') { extractedStickyBlock.zIndex = parseInt(zIndex) }
        if (typeof zIndex === 'number') { extractedStickyBlock.zIndex = zIndex }
        if (type === 'html' || type === 'module') { extractedStickyBlock.type = type }
        if (typeof content === 'string') { extractedStickyBlock.content = content }
        if (typeof trackScroll === 'boolean') { extractedStickyBlock.trackScroll = trackScroll }
        if (typeof layout === 'string') { extractedStickyBlock.layout = layout as LayoutName }
        if (typeof mobileLayout === 'string') { extractedStickyBlock.mobileLayout = mobileLayout as LayoutName }
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
