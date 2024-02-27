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
  isTransitionName,
  State
} from '~/components/Scrllgngn'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Scrollgneugneu }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    stickyBlocksLazyLoadDistance: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    stickyBlocksViewportHeight: (i: unknown) => i !== undefined ? toString(i) : undefined,
    stickyBlocksOffsetTop: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    forceStickBlocks: (i: unknown) => {
      if (i === undefined) return undefined
      const strI = toString(i)
      if (strI === 'before') return 'before'
      if (strI === 'after') return 'after'
      if (strI === 'both') return 'both'
      return undefined
    },
    thresholdOffset: (i: unknown) => i !== undefined ? toString(i) : undefined,
    bgColorTransitionDuration: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    pages: async (i: unknown) => Array.isArray(i) ? await arrayToPages(i, id) : undefined,
    onPageChange: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (state?: State) => {
        Events.sequentialHandlersCall(handlers, {
          details: { state },
          type: Events.Type.SCRLLGNGN_ON_PAGE_CHANGE,
          appId: id
        })
      }
    }
  })
  return props
}

/* * * * * * * * * * * * * * * * * * *
 * ARRAY TO PAGES
 * * * * * * * * * * * * * * * * * * */
async function arrayToPages (array: unknown[], id: string): Promise<PropsPageData[]> {
  const extractedPages: PropsPageData[] = []
  for (const pageData of array) {
    if (!isRecord(pageData)) continue
    const extractedPage: PropsPageData = await recordFormat(pageData, {
      id: (i: unknown) => i !== undefined ? toString(i) : undefined,
      bgColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
      blocks: async (i: unknown) => Array.isArray(i) ? await arrayToBlocks(i, id) : undefined
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
    const strDepth = blockData.depth !== undefined ? toString(blockData.depth) : undefined
    
    // depth?: 'scroll'
    if (strDepth === 'scroll' || strDepth === undefined) {
      const extractedScrollBlock: PropsScrollBlockData = await recordFormat(blockData, {
        depth: () => strDepth,
        id: (i: unknown) => i !== undefined ? toString(i) : undefined,
        zIndex: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
        type: (i: unknown) => {
          if (i === undefined) return undefined
          const strI = toString(i)
          if (strI === 'html') return 'html'
          if (strI === 'module') return 'module'
          return undefined
        },
        content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined, // [WIP] should be possible to have VNode if type === 'module'
        trackScroll: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
        layout: (i: unknown) => i !== undefined ? toString(i) as LayoutName : undefined,
        mobileLayout: (i: unknown) => i !== undefined ? toString(i) as LayoutName : undefined
      })
      extractedBlocks.push(extractedScrollBlock)
    
    // depth: 'front'|'back'
    } else if (strDepth === 'front' || strDepth === 'back') {
      const extractedStickyBlock: PropsStickyBlockData = await recordFormat(blockData, {
        depth: () => strDepth,
        id: (i: unknown) => i !== undefined ? toString(i) : undefined,
        zIndex: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
        type: (i: unknown) => {
          if (i === undefined) return undefined
          const strI = toString(i)
          if (strI === 'html') return 'html'
          if (strI === 'module') return 'module'
          return undefined
        },
        content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined, // [WIP] should be possible to have VNode if type === 'module'
        trackScroll: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
        layout: (i: unknown) => i !== undefined ? toString(i) as LayoutName : undefined,
        mobileLayout: (i: unknown) => i !== undefined ? toString(i) as LayoutName : undefined,
        transitions: (i: unknown) => {
          if (!Array.isArray(i)) return undefined
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
        },
        mobileTransitions: (i: unknown) => {
          if (!Array.isArray(i)) return undefined
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
        }
      })
      extractedBlocks.push(extractedStickyBlock)
    }
  }
  return extractedBlocks
}
