import { Apps } from '~/apps'
import { Events } from '~/shared/events'
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
  isTransitionName
} from '~/components/Scrllgngn'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Scrollgneugneu }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    stickyBlocksLazyLoadDistance: i => Apps.ifNotUndefinedHelper(i, toNumber),
    stickyBlocksViewportHeight: i => Apps.ifNotUndefinedHelper(i, toString),
    stickyBlocksOffsetTop: i => Apps.ifNotUndefinedHelper(i, toNumber),
    forceStickBlocks: i => Apps.ifNotUndefinedHelper(i, i => {
      const strI = toString(i)
      if (strI === 'before') return 'before'
      if (strI === 'after') return 'after'
      if (strI === 'both') return 'both'
      if (strI === 'none') return 'none'
      return undefined
    }),
    thresholdOffset: i => Apps.ifNotUndefinedHelper(i, toString),
    bgColorTransitionDuration: i => Apps.ifNotUndefinedHelper(i, toNumber),
    pages: i => Apps.ifArrayHelper(i, i => arrayToPages(i, id)),

    // Handlers
    onPageChange: i => Apps.makeHandlerHelper(Events.Type.SCRLLGNGN_PAGE_CHANGE, i, id)
  }) ?? {}
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO PAGES
 * * * * * * * * * * * * * * * * * * */
async function arrayToPages (array: unknown[], id: string): Promise<PropsPageData[]> {
  const extractedPages: PropsPageData[] = []
  for (const pageData of array) {
    if (!isRecord(pageData)) continue
    const extractedPage: PropsPageData = await recordFormat(pageData, {
      id: i => Apps.ifNotUndefinedHelper(i, toString),
      bgColor: i => Apps.ifNotUndefinedHelper(i, toString),
      blocks: i => Apps.ifArrayHelper(i, i => arrayToBlocks(i, id))
    })
    extractedPages.push(extractedPage)
  }
  return extractedPages
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO BLOCKS
 * * * * * * * * * * * * * * * * * * */
async function arrayToBlocks (array: unknown[], id: string): Promise<PropsBlockData[]> {
  const extractedBlocks: PropsBlockData[] = []
  for (const blockData of array) {
    if (!isRecord(blockData)) continue
    const strDepth = Apps.ifNotUndefinedHelper(blockData.depth, toString)
    
    // depth?: 'scroll'
    if (strDepth === 'scroll' || strDepth === undefined) {
      const extractedScrollBlock: PropsScrollBlockData = await recordFormat(blockData, {
        depth: () => strDepth,
        id: i => Apps.ifNotUndefinedHelper(i, toString),
        zIndex: i => Apps.ifNotUndefinedHelper(i, toNumber),
        type: i => Apps.ifNotUndefinedHelper(i, i => {
          const strI = toString(i)
          if (strI === 'html') return 'html'
          if (strI === 'module') return 'module'
          return undefined
        }),
        content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        trackScroll: i => Apps.ifNotUndefinedHelper(i, toBoolean),
        layout: i => Apps.ifNotUndefinedHelper(i, toString) as LayoutName | undefined,
        mobileLayout: i => Apps.ifNotUndefinedHelper(i, toString) as LayoutName | undefined
      })
      extractedBlocks.push(extractedScrollBlock)
    
    // depth: 'front'|'back'
    } else if (strDepth === 'front' || strDepth === 'back') {
      const extractedStickyBlock: PropsStickyBlockData = await recordFormat(blockData, {
        depth: () => strDepth,
        id: i => Apps.ifNotUndefinedHelper(i, toString),
        zIndex: i => Apps.ifNotUndefinedHelper(i, toNumber),
        type: i => Apps.ifNotUndefinedHelper(i, i => {
          const strI = toString(i)
          if (strI === 'html') return 'html'
          if (strI === 'module') return 'module'
          return undefined
        }),
        content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        trackScroll: i => Apps.ifNotUndefinedHelper(i, toBoolean),
        layout: i => Apps.ifNotUndefinedHelper(i, toString) as LayoutName | undefined,
        mobileLayout: i => Apps.ifNotUndefinedHelper(i, toString) as LayoutName | undefined,
        transitions: i => Apps.ifArrayHelper(i, i => {
          const transitionsArr: TransitionDescriptor[] = []
          i.forEach((transitionObj: unknown) => {
            if (!Array.isArray(transitionObj)) return;
            const [name, duration] = transitionObj
            const strName = toString(name)
            if (!isTransitionName(strName)) return;
            if (typeof duration === 'string' || typeof duration === 'number') transitionsArr.push([name, duration])
            else transitionsArr.push([name])
          })
          return transitionsArr
        }),
        mobileTransitions: i => Apps.ifArrayHelper(i, i => {
          const mobileTransitionsArr: TransitionDescriptor[] = []
          i.forEach((transitionObj: unknown) => {
            if (!Array.isArray(transitionObj)) return;
            const [name, duration] = transitionObj
            const strName = toString(name)
            if (!isTransitionName(strName)) return;
            if (typeof duration === 'string' || typeof duration === 'number') mobileTransitionsArr.push([name, duration])
            else mobileTransitionsArr.push([name])
          })
          return mobileTransitionsArr
        })
      })
      extractedBlocks.push(extractedStickyBlock)
    }
  }
  return extractedBlocks
}
