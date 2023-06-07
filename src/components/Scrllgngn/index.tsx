import { Component, JSX, VNode } from 'preact'

import { throttle } from '~/utils/throttle-debounce'
import clamp from '~/utils/clamp'
import bem from '~/utils/bem'
import { injectCssRule } from '~/utils/dynamic-css' // [WIP] use injectCssRule everywhere

import IntersectionObserverComponent from '~/components/IntersectionObserver'
import ResizeObserverComponent from '~/components/ResizeObserver'
import Paginator, { State as PaginatorState } from '~/components/Paginator'
import { Props as HeaderProps } from '~/components/Header'
import { Instruction, dispatchEvent } from '~/components/EventDispatcher'

import TransitionsWrapper from './TransitionsWrapper'
import BlockRenderer from './BlockRenderer'
import styles from './styles.module.scss'

export type LayoutSizeFormula = `${number}`|`${number}/${number}`
export type LayoutOffsetFormula = `${number}/${number}`
// [WIP] got rid of justif and align formulas
// const layoutJustificationFormulas = ['left', 'center', 'right'] as const
// type LayoutJustificationFormula = typeof layoutJustificationFormulas[number]
// const layoutAlignFormulas = ['top', 'middle', 'bottom'] as const
// type LayoutAlignFormula = typeof layoutAlignFormulas[number]
export type LayoutHPosFormula = LayoutSizeFormula|`${LayoutSizeFormula}(${LayoutOffsetFormula})`
export type LayoutVPosFormula = LayoutSizeFormula|`${LayoutSizeFormula}(${LayoutOffsetFormula})`
export type LayoutPosFormula = LayoutHPosFormula|`${LayoutHPosFormula}_${LayoutVPosFormula}`
// [WIP] got rid of justif and align formulas
// type LayoutContentPosFormula = LayoutJustificationFormula|LayoutAlignFormula|`${LayoutJustificationFormula}_${LayoutAlignFormula}`|`${LayoutAlignFormula}_${LayoutJustificationFormula}`
// type LayoutFormula = LayoutPosFormula|`${LayoutPosFormula}_${LayoutContentPosFormula}`
export type LayoutFormula = LayoutPosFormula

export type LayoutName = LayoutFormula
  |'fullscreen'
  |'full-screen'
  |'left-half'
  |'center-half'
  |'right-half'
  // [WIP] columns

/* Transition types */
export type TransitionName = 
  'fade'
  |'grow'
  |'whirl'
  |'slide-up'
  |'right-open'
  |'left-open'
export type TransitionDuration = string|number
export type TransitionDescriptor = [TransitionName]|[TransitionName, TransitionDuration]

/* Props stuff */
export type PropsCommonBlockData = {
  id?: string
  zIndex?: number
  type?: 'html'|'module'
  content?: string|VNode
  trackScroll?: boolean
}
export type PropsScrollBlockData = PropsCommonBlockData & {
  depth?: 'scroll'
  layout?: LayoutName
  mobileLayout?: LayoutName
}
export type PropsStickyBlockData = PropsCommonBlockData & {
  depth: 'back'|'front'
  layout?: LayoutName // [WIP] Don't bring that back in PropsCommonBlockData before being sure there are not sticky blocks specific layout names
  mobileLayout?: LayoutName // [WIP] Don't bring that back in PropsCommonBlockData before being sure there are not sticky blocks specific layout names
  transitions?: TransitionDescriptor[]
  mobileTransitions?: TransitionDescriptor[]
}
export type PropsBlockData = PropsScrollBlockData|PropsStickyBlockData

export type PropsPageData = {
  id?: string
  bgColor?: JSX.CSSProperties['backgroundColor']
  blocks?: PropsBlockData[]
  dispatchOnEnter?: [Instruction, any][]
  dispatchOnLeave?: [Instruction, any][]
}

export type Props = {
  customClass?: string
  stickyBlocksLazyLoadDistance?: number
  stickyBlocksViewportHeight?: string // [WIP] No relative units, maybe some regex checks here?
  stickyBlocksOffsetTop?: number
  forceStickBlocks?: 'before'|'after'|'both'
  thresholdOffset?: string
  bgColorTransitionDuration?: string|number
  pages?: PropsPageData[]
}

/* Context stuff */

export type BlockContext = {
  width: number|null
  height: number|null
  page: number|null
  progression: number|null
  pageProgression: number|null
}

export type PartialBlockContext = Partial<BlockContext>

const nullContext: BlockContext = {
  width: null,
  height: null,
  page: null,
  progression: null,
  pageProgression: null
}

export function createBlockContext (
  partialContext?: PartialBlockContext
): BlockContext {
  if (partialContext === undefined) return { ...nullContext }
  return { ...nullContext, ...partialContext }
}

// [WIP] add all return types
export const diffContexts = (
  initialContext: BlockContext,
  newContext: BlockContext) => {
  const returned: Partial<BlockContext> = {}
  Object.entries(newContext).map(([key, val]) => {
    const valFromInitial = (initialContext as any)[key]
    const valFromNew = val
    if (valFromNew !== valFromInitial) (returned as any)[key] = valFromNew
  })
  return returned
}

export function contextsAreEqual (
  contextA: BlockContext,
  contextB: BlockContext
): boolean {
  return Object.keys(contextA).every(_key => {
    const keyInA = _key in contextA
    const keyInB = _key in contextB
    if (!keyInA || !keyInB) return false
    const key = _key as keyof BlockContext
    return contextA[key] === contextB[key]
  })
}

/* Inner component stuff */

type BlockDisplayZone = number[]
type BlockIdentifier = string

function getNeighbourIntegersSeries (_array: number[]|Set<number>): number[][] {
  const result: number[][] = []
  const dedupedIntArray = [...new Set(_array)].filter(num => Number.isInteger(num))
  dedupedIntArray.forEach(num => {
    const numHasAlreadyASeries = result.some(series => series.includes(num))
    if (numHasAlreadyASeries) return
    const numSeries = getIntNeighboursInNumbersSet(num, dedupedIntArray)
    result.push(numSeries)
  })
  return result
}

function getIntNeighboursInNumbersSet (
  integer: number,
  _array: number[]|Set<number>
): number[] {
  const dedupedIntArray = [...new Set(_array)].filter(num => Number.isInteger(num))
  if (!dedupedIntArray.includes(integer)) return []
  const result = [integer]
  const lower = dedupedIntArray.filter(num => num < integer).sort((a, b) => b - a)
  const higher = dedupedIntArray.filter(num => num > integer).sort((a, b) => a - b)
  lower.forEach(num => {
    const firstPos = result[0]
    if (firstPos === undefined) return
    if (firstPos - num === 1) result.unshift(num)
  })
  higher.forEach(num => {
    const lastPos = result[result.length - 1] as number|undefined
    if (lastPos === undefined) return
    if (num - lastPos === 1) result.push(num)
  })
  return result
}

/* State stuff */
type StateCommonBlockData = {
  _id: string
  _zIndex: number
  _displayZones: BlockDisplayZone[]
  _context: BlockContext
}
type StateScrollBlockData = PropsScrollBlockData & StateCommonBlockData
type StateStickyBlockData = PropsStickyBlockData & StateCommonBlockData
type StateBlockData = StateScrollBlockData|StateStickyBlockData

type StatePageData = PropsPageData & {
  _blocksIds: Set<BlockIdentifier>
  _trackScroll: boolean
}

type State = {
  pages: Map<number, StatePageData>,
  blocks: Map<BlockIdentifier, StateBlockData>,
  cssUrlDataMap: Map<string, string>
  prevPropsPages?: PropsPageData[]
  currPagePos?: number
  prevPagePos?: number
  topVisible?: boolean
  cntVisible?: boolean
  btmVisible?: boolean
  scrollingPanelHeight?: number
  scrollingPanelWidth?: number
}

/* Actual Component */
// [WIP] PureComponent one day??? PureComponents everywhere ???
export default class Scrollgneugneu extends Component<Props, State> {
  static getDerivedStateFromProps (
    props: Props,
    state: State
  ): State|null {
    const {
      getBlockDisplayZones,
      getBlocksZIndexes,
    } = Scrollgneugneu
    const { prevPropsPages } = state
    if (props.pages === prevPropsPages) return null
    const { blocks: currentStateBlocks } = state
    const blocks = new Map<BlockIdentifier, StateBlockData>()
    const zIndexes = getBlocksZIndexes(props.pages ?? [])
    props.pages?.forEach((pageData, pagePos) => {
      pageData.blocks?.forEach((blockData, blockPos) => {
        const blockIdentifier = blockData.id ?? `${pagePos}-${blockPos}`
        const alreadyInMap = blocks.has(blockIdentifier)
        if (alreadyInMap) return
        const _zIndex = zIndexes.get(blockIdentifier) ?? 0
        const _displayZones = getBlockDisplayZones(blockIdentifier, props.pages ?? [])
        const currentStateBlock = currentStateBlocks.get(blockIdentifier)
        const _context = currentStateBlock?._context ?? createBlockContext()
        const stateBlockData: StateBlockData = {
          ...blockData,
          _id: blockIdentifier,
          _zIndex,
          _displayZones,
          _context
        }
        blocks.set(blockIdentifier, stateBlockData)
      })
    })
    const pages = new Map<number, StatePageData>()
    props.pages?.forEach((pageData, pagePos) => {
      const _blocksIds = new Set<BlockIdentifier>()
      pageData.blocks?.forEach((blockData, blockPos) => {
        const blockIdentifier = blockData.id ?? `${pagePos}-${blockPos}`
        _blocksIds.add(blockIdentifier)
      })
      const _trackScroll = [..._blocksIds].some(id => blocks.get(id)?.trackScroll === true)
      pages.set(pagePos, { ...pageData, _blocksIds, _trackScroll })
    })
    const newState = {
      ...state,
      pages,
      blocks,
      prevPropsPages: props.pages
    }
    return newState
  }

  static getBlockPages (
    blockIdentifier: BlockIdentifier,
    pagesData: PropsPageData[]
  ): number[] {
    const result: number[] = []
    pagesData.forEach((pageData, pagePos) => {
      const pageIncludesBlock = pageData.blocks?.some((blockData, blockPos) => {
        const thisBlockId = blockData.id ?? `${pagePos}-${blockPos}`
        return thisBlockId === blockIdentifier
      })
      if (pageIncludesBlock) result.push(pagePos)
    })
    return result
  }

  static getBlockDisplayZones (
    blockIdentifier: BlockIdentifier,
    pagesData: PropsPageData[]
  ): BlockDisplayZone[] {
    const { getBlockPages } = Scrollgneugneu
    const blockPages = getBlockPages(blockIdentifier, pagesData)
    const displayZones = getNeighbourIntegersSeries(blockPages)
    return displayZones
  }

  static getBlocksZIndexes (
    pagesData: PropsPageData[]
  ): Map<BlockIdentifier, number> {
    const blocksIdentifierToDataMap = new Map<BlockIdentifier, PropsBlockData>()
    pagesData.forEach((pageData, pagePos) => {
      const blocks = pageData.blocks
      blocks?.forEach((blockData, blockPos) => {
        const blockIdentifier = blockData.id ?? `${pagePos}-${blockPos}`
        if (blocksIdentifierToDataMap.has(blockIdentifier)) return
        blocksIdentifierToDataMap.set(blockIdentifier, blockData)
      })
    })
    const backBlocksDataToIdMap = new Map<PropsBlockData, BlockIdentifier>()
    const scrollBlocksDataToIdMap = new Map<PropsBlockData, BlockIdentifier>()
    const frontBlocksDataToIdMap = new Map<PropsBlockData, BlockIdentifier>()
    blocksIdentifierToDataMap.forEach((blockData, blockId) => {
      if (blockData.depth === 'back') backBlocksDataToIdMap.set(blockData, blockId)
      else if (blockData.depth === 'front') frontBlocksDataToIdMap.set(blockData, blockId)
      else scrollBlocksDataToIdMap.set(blockData, blockId)
    })
    const zIndexes = new Map<BlockIdentifier, number>()
    let currentZIndex = 0
    const blocksSorter = (
      a: [PropsBlockData, BlockIdentifier],
      b: [PropsBlockData, BlockIdentifier]
    ) => {
      const aDepth = (a[0].zIndex ?? 0)
      const bDepth = (b[0].zIndex ?? 0)
      return aDepth - bDepth
    }
    const zIndexesFiller = ([_, blockId]: [PropsBlockData, BlockIdentifier]) => {
      zIndexes.set(blockId, currentZIndex)
      currentZIndex ++
    }
    // Back blocks
    Array
      .from(backBlocksDataToIdMap.entries())
      .sort(blocksSorter)
      .forEach(zIndexesFiller)
    // Scroll blocks
    Array
      .from(scrollBlocksDataToIdMap.entries())
      .sort(blocksSorter)
      .forEach(zIndexesFiller)
    // Front blocks
    Array
      .from(frontBlocksDataToIdMap.entries())
      .sort(blocksSorter)
      .forEach(zIndexesFiller)

    return zIndexes
  }

  static layoutNameToFormula (name: string): LayoutFormula|undefined {
    if (name === 'fullscreen') return '1_1'
    if (name === 'full-screen') return '1_1'
    if (name === 'left-half') return '1/2_1'
    if (name === 'center-half') return '1/2(1/4)_1'
    if (name === 'right-half') return '1/2(1/2)_1'
  }

  static generateLayoutClasses (
    position: 'scrolling'|'sticky',
    _layout?: LayoutName,
    _mobileLayout?: LayoutName
  ): string[] {
    const {
      layoutNameToFormula: toFormula,
      layoutPosAndFormulaToCssProps: toCss
    } = Scrollgneugneu
    const layout = (toFormula(_layout ?? '') ?? _layout) as LayoutFormula|undefined
    const mobileLayout = (toFormula(_mobileLayout ?? '') ?? _mobileLayout) as LayoutFormula|undefined
    const layoutCss = layout !== undefined ? toCss(position, layout) : undefined
    const mobileLayoutCss = mobileLayout !== undefined ? toCss(position, mobileLayout) : layoutCss
    const hasLayout = layout !== undefined
    const hasMobileLayout = mobileLayout !== undefined
    const layoutClassExt = hasLayout
      ? layout
        .replace(/\//igm, 'over')
        .replace(/\(/igm, 'offset')
        .replace(/\./igm, 'dot')
        .replace(/\)/igm, '')
        .replace(/[^a-z0-9\-\_]/igm, '')
      : undefined
    const mobileLayoutClassExt = hasMobileLayout
      ? mobileLayout
        .replace(/\//igm, 'over')
        .replace(/\(/igm, 'offset')
        .replace(/\./igm, 'dot')
        .replace(/\)/igm, '')
        .replace(/[^a-z0-9\-\_]/igm, '')
      : undefined
    const layoutClass = hasLayout ? `${styles['block']}_layout-${layoutClassExt}` : undefined
    const mobileLayoutClass = hasMobileLayout
      ? `${styles['block']}_mobile-layout-${mobileLayoutClassExt}`
      : (hasLayout ? `${styles['block']}_mobile-layout-${layoutClassExt}` : undefined)
    const classes: string[] = []
    if (layoutClass !== undefined) {
      classes.push(layoutClass)
      const selectors = [
        `.${styles['block']}`,
        `.${styles[`block_${position}`]}`,
        `.${layoutClass}`
      ].join('')
      const mediaQuery = '@media (min-width: 1025px)'
      const cssBlock = `${mediaQuery} { ${selectors} { ${layoutCss} } }`
      injectCssRule(cssBlock, `${layoutClass}____${position}`)
    }
    if (mobileLayoutClass !== undefined) {
      classes.push(mobileLayoutClass)
      const selectors = [
        `.${styles['block']}`,
        `.${styles[`block_${position}`]}`,
        `.${mobileLayoutClass}`
      ].join('')
      const mediaQuery = '@media (max-width: 1024px)'
      const cssBlock = `${mediaQuery} { ${selectors} { ${mobileLayoutCss} } }`
      injectCssRule(cssBlock, `${mobileLayoutClass}____${position}`)
    }
    return classes
  }

  static layoutPosAndFormulaToCssProps (
    position: 'scrolling'|'sticky',
    formula: LayoutFormula): string {
    const chunks = formula.split('_')
    // Get position chunks
    const numRegex = '[0-9]+([0-9]+)?(\\.[0-9]+)?'
    const fractionRegex = `${numRegex}(\\/${numRegex})?`
    const posChunkRegex = new RegExp(`^${fractionRegex}(\\(${fractionRegex}\\))?$`, 'igm')
    const hPosChunk = chunks.find((chunk, pos) => pos === 0 && chunk.match(posChunkRegex))
    const vPosChunk = chunks.find((chunk, pos) => pos !== 0 && chunk.match(posChunkRegex))
    // Get width, height, hOffset and vOffset
    const [widthChunk, hOffsetChunk] = hPosChunk?.split(/\(|\)/) ?? [undefined, undefined]
    const [widthNum, widthDenum] = widthChunk?.split('/') ?? [undefined, undefined]
    const [hOffsetNum, hOffsetDenum] = hOffsetChunk?.split('/') ?? [undefined, undefined]
    const [heightChunk, vOffsetChunk] = vPosChunk?.split(/\(|\)/) ?? [undefined, undefined]
    const [heightNum, heightDenum] = heightChunk?.split('/') ?? [undefined, undefined]
    const [vOffsetNum, vOffsetDenum] = vOffsetChunk?.split('/') ?? [undefined, undefined]
    // [WIP] got rid of this // Get justification and align
    // const justificationFormulas = layoutJustificationFormulas as unknown as string[]
    // const alignFormulas = layoutAlignFormulas as unknown as string[]
    // const justifyChunk = chunks.find(chunk => justificationFormulas.includes(chunk))
    // const alignChunk = chunks.find(chunk => alignFormulas.includes(chunk))
    // Create
    const cssProps: string[] = []
    // Position properties
    cssProps.push(`width: calc(${widthNum ?? 1} * var(--scrolling-block-width) / ${widthDenum ?? 1});`)
    if (position === 'scrolling') cssProps.push(`margin-left: calc(${hOffsetNum ?? 0} * 100% / ${hOffsetDenum ?? 1});`)
    else if (position === 'sticky') {
      cssProps.push(`height: calc(${heightNum ?? 1} * var(--sticky-blocks-viewport-height) / ${heightDenum ?? 1});`)
      cssProps.push(`transform: translate(
        calc(${hOffsetNum ?? 0} * var(--scrolling-block-width) / ${hOffsetDenum ?? 1}),
        calc(${vOffsetNum ?? 0} * var(--sticky-blocks-viewport-height) / ${vOffsetDenum ?? 1})
      );`.replace(/\n/igm, ' ').replace(/\s+/igm, ' '))
    }
    // [WIP] got rid of this // Content justification properties
    // if (justifyChunk === 'left') cssProps.push(`justify-content: flex-start;`)
    // else if (justifyChunk === 'center') cssProps.push(`justify-content: center;`)
    // else if (justifyChunk === 'right') cssProps.push(`justify-content: flex-end;`)
    // [WIP] got rid of this // Content alignment properties
    // if (alignChunk === 'top') cssProps.push(`align-items: flex-start;`)
    // else if (alignChunk === 'middle') cssProps.push(`align-items: center;`)
    // else if (alignChunk === 'bottom') cssProps.push(`align-items: flex-end;`)
    return cssProps.join('')
  }

  constructor (props: Props) {
    super(props)
    this.getBgColorTransitionDuration = this.getBgColorTransitionDuration.bind(this)
    this.loadCss = this.loadCss.bind(this)
    this.boundsDetection = this.boundsDetection.bind(this)
    this.getThresholdRect = this.getThresholdRect.bind(this)
    this.throttledGetThresholdRect = this.throttledGetThresholdRect.bind(this)
    this.isBlockSticky = this.isBlockSticky.bind(this)
    this.getBlockStatus = this.getBlockStatus.bind(this)
    this.getBlockDistanceFromDisplay = this.getBlockDistanceFromDisplay.bind(this)
    this.getPagesRects = this.getPagesRects.bind(this)
    this.getCurrPagePos = this.getCurrPagePos.bind(this)
    this.getBlocksContextMap = this.getBlocksContextMap.bind(this)
    this.getBlocksContextPage = this.getBlocksContextPage.bind(this)
    this.getBlocksContextSize = this.getBlocksContextSize.bind(this)
    this.getBlocksContextProgression = this.getBlocksContextProgression.bind(this)
    this.mergeBlocksPartialContexts = this.mergeBlocksPartialContexts.bind(this)
    this.handlePaginatorResize = this.handlePaginatorResize.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.handleWindowScroll = this.handleWindowScroll.bind(this)
    this.handleBlockResize = this.handleBlockResize.bind(this)
    this.throttledHandleBlockResize = this.throttledHandleBlockResize.bind(this)
    this.cleanRefsMaps = this.cleanRefsMaps.bind(this)
    this.getCurrentPageData = this.getCurrentPageData.bind(this)
    this.getPreviousPageData = this.getPreviousPageData.bind(this)
    this.injectModulesStyles = this.injectModulesStyles.bind(this)
    this.StickyBlocks = this.StickyBlocks.bind(this)
    this.ScrollingBlocks = this.ScrollingBlocks.bind(this)
  }

  state: State = {
    pages: new Map(),
    blocks: new Map(),
    cssUrlDataMap: new Map(),
    currPagePos: 0
  }

  boundsDetectionInterval: number|null = null

  componentDidMount(): void {
    const {
      handleWindowScroll,
      cleanRefsMaps,
      throttledBoundsDetection
    } = this
    cleanRefsMaps()
    window.addEventListener('scroll', handleWindowScroll)
    this.boundsDetectionInterval = window.setInterval(throttledBoundsDetection, 2000)
    handleWindowScroll()
  }

  componentDidUpdate(): void {
    const { cleanRefsMaps } = this
    cleanRefsMaps()
  }

  componentWillUnmount(): void {
    const {
      handleWindowScroll,
      boundsDetectionInterval
    } = this
    if (boundsDetectionInterval !== null) window.clearInterval(boundsDetectionInterval)
    window.removeEventListener('scroll', handleWindowScroll)
  }

  /**
   * Loads a CSS file from url and stores data in state,
   * if something goes wrong, the loading is retried
   * up to three times (500ms delay) before giving up
   */
  loadCssAttemptsMap = new Map<string, number>()
  async loadCss (url: string): Promise<void> {
    const {
      loadCss,
      loadCssAttemptsMap,
      state
    } = this
    const alreadyLoadedData = state.cssUrlDataMap.get(url)
    if (alreadyLoadedData !== undefined) return
    const attemptsCnt = loadCssAttemptsMap.get(url) ?? 0
    if (attemptsCnt >= 3) return
    loadCssAttemptsMap.set(url, attemptsCnt + 1)
    try {
      const requestResponse = await window.fetch(url)
      const responseData = await requestResponse.text()
      this.setState(curr => {
        const currCssFilesMap = curr.cssUrlDataMap
        const newCssFilesMap = new Map(currCssFilesMap ?? [])
        newCssFilesMap.set(url, responseData)
        return { ...curr, cssUrlDataMap: newCssFilesMap }
      })
    } catch (err) {
      window.setTimeout(() => loadCss(url), 500)
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   * GET BG COLOR TRANSITION DURATION
   * * * * * * * * * * * * * * * * * * * * * */
  getBgColorTransitionDuration (): string {
    const { bgColorTransitionDuration } = this.props
    if (typeof bgColorTransitionDuration === 'number') return `${bgColorTransitionDuration}ms`
    if (typeof bgColorTransitionDuration === 'string') return bgColorTransitionDuration
    return '200ms'
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   * SCRLGNGN POSITION DETECTION IN WINDOW
   * * * * * * * * * * * * * * * * * * * * * */
  boundsDetection () {
    const {
      paginatorRef,
      topBoundRef,
      btmBoundRef,
      props
    } = this
    const { stickyBlocksOffsetTop } = props
    const refToStateKeyMap = new Map<
      'topVisible'|'cntVisible'|'btmVisible',
      HTMLDivElement|null
    >([
      ['topVisible', topBoundRef],
      ['cntVisible', paginatorRef?.$scrollableArea ?? null],
      ['btmVisible', btmBoundRef]
    ])
    const partialState: Partial<State> = {}
    refToStateKeyMap.forEach((ref, stateKey) => {
      if (ref === null) return
      const { y, height } = ref.getBoundingClientRect()
      const { innerHeight } = window
      const isIntersecting = y <= innerHeight && y + height >= (stickyBlocksOffsetTop ?? 0);
      partialState[stateKey] = isIntersecting
    })
    return this.setState(curr => {
      const partialStateEntries = Object.keys(partialState) as (keyof State)[]
      const hasChanges = partialStateEntries.some(key => {
        const val = partialState[key]
        return curr[key] !== val
      })
      if (!hasChanges) return null
      return {
        ...curr,
        ...partialState
      }
    })
  }

  throttledBoundsDetection = throttle(
    this.boundsDetection.bind(this),
    50
  ).throttled

  getThresholdRect () {
    const { paginatorRef } = this
    if (paginatorRef === null) return;
    return paginatorRef.getThresholdBarBoundingClientRect()
  }

  throttledGetThresholdRect = throttle(
    this.getThresholdRect.bind(this),
    1000
  ).throttled

  isBlockSticky (blockIdentifier: BlockIdentifier) {
    const { state } = this
    const { blocks } = state
    const blockData = blocks.get(blockIdentifier)
    if (blockData === undefined) return undefined
    return blockData.depth === 'front'
      || blockData.depth === 'back'
  }

  getBlockStatus (blockIdentifier: BlockIdentifier) {
    const { getCurrentPageData, getPreviousPageData } = this
    const currPageData = getCurrentPageData()
    const prevPageData = getPreviousPageData()
    if (currPageData?._blocksIds.has(blockIdentifier)) return 'current'
    else if (prevPageData?._blocksIds.has(blockIdentifier)) return 'previous'
    else return 'inactive'
  }

  getBlockDistanceFromDisplay (blockIdentifier: BlockIdentifier) {
    const { state } = this
    const { blocks, currPagePos } = state
    if (currPagePos === undefined) return;
    const blockData = blocks.get(blockIdentifier)
    if (blockData === undefined) return;
    const blockPages = blockData._displayZones.flat()
    const pagesDistances = blockPages
      .map(pagePos => Math.abs((pagePos - currPagePos)))
      .sort((a, b) => a - b)
    const nearestPageDistance = pagesDistances[0] as number|undefined
    return nearestPageDistance
  }

  getPagesRects () {
    const { state, pagesRefsMap } = this
    const { pages } = state
    return new Map([...pages].map(([pagePos]) => {
      const pageRef = pagesRefsMap.get(pagePos) ?? undefined
      if (pageRef === undefined) return [pagePos, undefined]
      const pageRect = pageRef.getBoundingClientRect()
      return [pagePos, pageRect]
    }))
  }

  getCurrPagePos (inputPaginatorState?: PaginatorState) {
    const { state, paginatorRef } = this
    const paginatorState = inputPaginatorState !== undefined
      ? inputPaginatorState
      : paginatorRef?.state
    let currPagePos = state.currPagePos
    if (paginatorState !== undefined) {
      currPagePos = paginatorState.value
      const { coming, active, passed } = paginatorState
      const pagesLength = active.length + coming.length + passed.length
      const hasPages = pagesLength > 0
      const noneComing = coming.length === 0
      const nonePassed = passed.length === 0
      const noneActive = active.length === 0
      const isBeforeFirst = hasPages && noneActive && nonePassed
      const isAfterLast = hasPages && noneActive && noneComing
      if (isBeforeFirst) currPagePos = hasPages ? 0 : undefined
      if (isAfterLast) currPagePos = hasPages ? pagesLength - 1 : undefined
    }
    return currPagePos
  }

  getBlocksContextMap () {
    const { blocks } = this.state
    return new Map([...blocks.entries()].map(([id, data]) => [id, data._context]))
  }

  getBlocksContextPage (inputPaginatorState?: PaginatorState): Map<string, Partial<BlockContext>> {
    const { state, getCurrPagePos } = this
    const currPagePos = getCurrPagePos(inputPaginatorState)
    const { blocks } = state
    const blocksWithPage = new Map<string, Partial<BlockContext>>()
    for (const [blockId, blockData] of blocks) {
      const currBlockContextPage = blockData._context.page
      const blockPages = blockData._displayZones.flat()
      let blockContextPage: number|null = null
      if (currPagePos === undefined) blockContextPage = null
      else {
        const currPagePosInDisplayZone = blockPages.indexOf(currPagePos)
        if (currPagePosInDisplayZone === -1) blockContextPage = null
        else blockContextPage = currPagePosInDisplayZone
      }
      if (currBlockContextPage === blockContextPage) blocksWithPage.set(blockId, { page: blockData._context.page })
      else blocksWithPage.set(blockId, { page: blockContextPage })
    }
    return blocksWithPage
  }

  getBlocksContextSize (): Map<string, Partial<BlockContext>> {
    const { state, blocksRefsMap } = this
    const { blocks } = state
    const blocksWithSize = new Map<string, Partial<BlockContext>>()
    Array.from(blocks).forEach(([blockId]) => {
      const blockRef = blocksRefsMap.get(blockId)
      if (blockRef === null || blockRef === undefined) return blocksWithSize.set(blockId, { width: null, height: null })
      const { width, height } = blockRef.getBoundingClientRect()
      blocksWithSize.set(blockId, { width, height })
    })
    return blocksWithSize
  }

  getBlocksContextProgression (inputPaginatorState?: PaginatorState): Map<string, Partial<BlockContext>> {
    const {
      state,
      getCurrPagePos,
      getCurrentPageData,
      throttledGetThresholdRect,
      getPagesRects
    } = this
    const currPagePos = getCurrPagePos(inputPaginatorState)
    const { blocks } = state
    const blocksWithProgression = new Map<string, Partial<BlockContext>>()
    const currPageData = getCurrentPageData()
    const thresholdRect = throttledGetThresholdRect().returnValue
    // Not possible to calculate progressions
    if (currPagePos === undefined
      || currPageData === undefined
      || currPageData._trackScroll !== true
      || thresholdRect === undefined) {
      for (const [blockId, blockData] of blocks) {
        const currBlockContext = blockData._context
        blocksWithProgression.set(blockId, {
          progression: currBlockContext.progression,
          pageProgression: currBlockContext.pageProgression
        })
      }
      return blocksWithProgression
    }
    const pagesRects = getPagesRects()
    const pagesScrollData = new Map([...pagesRects].map(([pos, domRect]) => {
      if (domRect === undefined) return [pos, undefined]
      const rawScrolled = thresholdRect.top - domRect.top
      const rawProgression = rawScrolled / domRect.height
      const progression = clamp(rawProgression, 0, 1)
      const scrolled = clamp(rawScrolled, 0, domRect.height)
      const { height } = domRect
      return [pos, { height, scrolled, progression }]
    }))
    for (const [blockId, blockData] of blocks) {
      const currBlockContext = blockData._context
      const currBlockPartialContext: Partial<BlockContext> = {
        progression: currBlockContext?.progression ?? null,
        pageProgression: currBlockContext?.pageProgression ?? null
      }
      // Block doesnt need trackScroll
      if (blockData.trackScroll !== true) {
        blocksWithProgression.set(blockId, { progression: null, pageProgression: null })
        continue
      }
      const displayZones = blockData._displayZones
      const currDisplayZone = displayZones.find(dz => currPagePos !== undefined
        ? dz.includes(currPagePos)
        : false)
      // Block is not currently displayed
      if (currDisplayZone === undefined) {
        blocksWithProgression.set(blockId, currBlockPartialContext)
        continue
      }
      // Progressions calculation
      const currDz = blockData._displayZones.find(dz => dz.includes(currPagePos))
      if (currDz === undefined) {
        blocksWithProgression.set(blockId, currBlockPartialContext)
        continue
      }
      const dzProgression = currDz.reduce(
        (acc, curr) => {
          const pageScrollData = pagesScrollData.get(curr)
          if (pageScrollData === undefined) return acc
          const height = acc.height + pageScrollData.height
          const scrolled = acc.scrolled + pageScrollData.scrolled
          const progression = scrolled / height
          return { height, scrolled, progression }
        },
        { height: 0, scrolled: 0, progression: 0 }
      ).progression
      const pageProgression = pagesScrollData.get(currPagePos)?.progression
      blocksWithProgression.set(blockId, {
        progression: dzProgression,
        pageProgression: pageProgression ?? currBlockContext.pageProgression
      }) 
    }
    return blocksWithProgression
  }

  mergeBlocksPartialContexts (...blocksPartialContextsMaps: Map<string, Partial<BlockContext>>[]) {
    const merged: Map<string, BlockContext> = new Map()
    blocksPartialContextsMaps.forEach(blocksPartialContextMap => {
      blocksPartialContextMap.forEach((partialContext, blockId) => {
        const contextInMerged = merged.get(blockId) ?? createBlockContext()
        const toPushInMerged = createBlockContext({
          ...contextInMerged,
          ...partialContext
        })
        merged.set(blockId, toPushInMerged)
      })
    })
    return merged
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   * HANDLE PAGINATOR RESIZE
   * * * * * * * * * * * * * * * * * * * * * */
  handlePaginatorResize (entries: ResizeObserverEntry[]) {
    const $paginator = entries[0]
    if ($paginator === undefined) return
    const { contentRect } = $paginator
    const { height, width } = contentRect
    this.setState(curr => {
      if (curr.scrollingPanelHeight === height
        && curr.scrollingPanelWidth === width) return null
      return {
        ...curr,
        scrollingPanelHeight: height,
        scrollingPanelWidth: width
      }
    })
  }

  handlePageChange (paginatorState: PaginatorState) {
    const {
      state,
      getCurrPagePos,
      getBlocksContextMap,
      getBlocksContextSize,
      getBlocksContextPage,
      mergeBlocksPartialContexts
    } = this
    const newCurrentPagePos = getCurrPagePos(paginatorState)
    const blocksContextPage = getBlocksContextPage(paginatorState)
    const blocksContextSize = getBlocksContextSize()
    const currBlocksContext = getBlocksContextMap()
    const newBlocksContexts = mergeBlocksPartialContexts(
      currBlocksContext,
      blocksContextPage,
      blocksContextSize)
    const { blocks, pages } = state
    const newBlocks = new Map(blocks)
    newBlocksContexts.forEach((blockContext, blockId) => {
      const blockData = newBlocks.get(blockId)
      if (blockData === undefined) return;
      newBlocks.set(blockId, {
        ...blockData,
        _context: blockContext
      })
    })
    // Dispatch on leave
    const prevPageData = state.currPagePos !== undefined
      ? pages.get(state.currPagePos)
      : undefined
    if (prevPageData !== undefined) {
      const toDispatch = prevPageData.dispatchOnLeave
      if (toDispatch !== undefined
        && toDispatch.length !== 0) {
        toDispatch.forEach(([instruction, payload]) => {
          dispatchEvent(instruction, payload)
        })
      }
    }
    // Dispatch on enter
    const newPageData = newCurrentPagePos !== undefined
      ? pages.get(newCurrentPagePos)
      : undefined
    if (newPageData !== undefined) {
      const toDispatch = newPageData.dispatchOnEnter
      if (toDispatch !== undefined
        && toDispatch.length !== 0) {
        toDispatch.forEach(([instruction, payload]) => {
          dispatchEvent(instruction, payload)
        })
      }
    }
    return this.setState(curr => {
      return {
        ...curr,
        currPagePos: newCurrentPagePos,
        prevPagePos: curr.currPagePos,
        blocks: newBlocks
      }
    })
  }

  handleWindowScroll () {
    const {
      state,
      getBlocksContextProgression,
      getBlocksContextMap,
      mergeBlocksPartialContexts
    } = this
    const blocksContextProgression = getBlocksContextProgression()
    const currBlocksContext = getBlocksContextMap()
    const newBlocksContexts = mergeBlocksPartialContexts(
      currBlocksContext,
      blocksContextProgression)
    const { blocks } = state
    const newBlocks = new Map(blocks)
    newBlocksContexts.forEach((blockContext, blockId) => {
      const blockData = newBlocks.get(blockId)
      if (blockData === undefined) return;
      newBlocks.set(blockId, {
        ...blockData,
        _context: blockContext
      })
    })
    const shouldUpdate = Array.from(blocks).some(([blockId, blockData]) => {
      const newContext = newBlocksContexts.get(blockId)
      const currContext = blockData._context
      if (newContext === undefined) return true
      return !contextsAreEqual(currContext, newContext)
    })
    if (!shouldUpdate) return
    return this.setState(curr => ({
      ...curr,
      blocks: newBlocks
    }))
  }

  handleBlockResize () {
    const {
      state,
      getBlocksContextMap,
      getBlocksContextSize,
      getBlocksContextPage,
      getBlocksContextProgression,
      mergeBlocksPartialContexts
    } = this
    const blocksContextSize = getBlocksContextSize()
    const blocksContextPage = getBlocksContextPage()
    const blocksContextProgression = getBlocksContextProgression()
    const currBlocksContext = getBlocksContextMap()
    const newBlocksContexts = mergeBlocksPartialContexts(
      currBlocksContext,
      blocksContextSize,
      blocksContextPage,
      blocksContextProgression
    )
    const { blocks } = state
    const newBlocks = new Map(blocks)
    const shouldUpdate = Array.from(newBlocks).some(([blockId, blockData]) => {
      const newContext = newBlocksContexts.get(blockId)
      const currContext = blockData._context
      if (newContext === undefined) return true
      return !contextsAreEqual(currContext, newContext)
    })
    if (!shouldUpdate) return
    newBlocksContexts.forEach((blockContext, blockId) => {
      const blockData = newBlocks.get(blockId)
      if (blockData === undefined) return;
      newBlocks.set(blockId, {
        ...blockData,
        _context: blockContext
      })
    })
    return this.setState(curr => ({
      ...curr,
      blocks: newBlocks
    }))
  }

  throttledHandleBlockResize = throttle(
    this.handleBlockResize.bind(this),
    500
  ).throttled

  paginatorRef: Paginator|null = null
  topBoundRef: HTMLDivElement|null = null
  btmBoundRef: HTMLDivElement|null = null
  pagesRefsMap: Map<number, HTMLDivElement|null> = new Map()
  blocksRefsMap: Map<BlockIdentifier, HTMLDivElement|null> = new Map()
  
  cleanRefsMaps () {
    const { pagesRefsMap, blocksRefsMap } = this
    new Map(pagesRefsMap).forEach((pageRef, pagePos) => {
      if (pageRef !== null) return;
      pagesRefsMap.delete(pagePos)
    })
    new Map(blocksRefsMap).forEach((blockRef, blockId) => {
      if (blockRef !== null) return;
      blocksRefsMap.delete(blockId)
    })
  }

  getCurrentPageData () {
    const { state } = this
    const { currPagePos, pages } = state
    return currPagePos !== undefined
      ? pages.get(currPagePos)
      : undefined
  }

  getPreviousPageData () {
    const { state } = this
    const { prevPagePos, pages } = state
    return prevPagePos !== undefined
      ? pages.get(prevPagePos)
      : undefined
  }

  wrapperBemClass = bem('lm-scrllgngn')

  // [WIP] Take back the styles load and display to BlockRenderer 
  injectModulesStyles () {
    const { state } = this
    const { cssUrlDataMap } = state
    const fullCssStr = Array
      .from(cssUrlDataMap)
      .map(([url, data]) => {
        const cssStr = data
          .trim()
          .replace(/\s+/igm, ' ')
        return `/*${url}*/\n${cssStr}`
      })
    fullCssStr
      .forEach(cssBlock => injectCssRule(cssBlock))
  }

  StickyBlocks () {
    const { generateLayoutClasses } = Scrollgneugneu
    const {
      props,
      state,
      blocksRefsMap,
      wrapperBemClass,
      isBlockSticky,
      getBlockStatus,
      getBlockDistanceFromDisplay,
      loadCss,
      throttledHandleBlockResize,
    } = this
    const { stickyBlocksLazyLoadDistance } = props
    const lazyLoadDistance = Math.max(stickyBlocksLazyLoadDistance ?? 2, 1)
    const { blocks, currPagePos } = state
    return <>
      {/* STICKY BLOCKS */}
      {[...blocks].map(([blockIdentifier, scrollOrStickyBlockData]) => {
        const blockDistance = getBlockDistanceFromDisplay(blockIdentifier)
        if (blockDistance === undefined) return null
        if (blockDistance > lazyLoadDistance) return null
        const blockIsSticky = isBlockSticky(blockIdentifier)
        if (!blockIsSticky) return null
        const blockData = scrollOrStickyBlockData as StateStickyBlockData
        const {
          type,         content,     layout,
          mobileLayout, transitions, mobileTransitions,
          _zIndex,      _context
        } = blockData
        const blockStatus = getBlockStatus(blockIdentifier)
        const blockPages = blockData._displayZones.flat()
        const currPagePosIsDefined = currPagePos !== undefined
        const blockIsAllOnPagesAbove = blockPages.every(pos => currPagePosIsDefined && pos < currPagePos)
        const blockIsAllOnPagesBelow = blockPages.every(pos => currPagePosIsDefined && pos > currPagePos)
        const blockIsOnSomePagesAbove = !blockIsAllOnPagesAbove && blockPages.some(pos => currPagePosIsDefined && pos < currPagePos)
        const blockIsOnSomePagesBelow = !blockIsAllOnPagesBelow && blockPages.some(pos => currPagePosIsDefined && pos > currPagePos)
        const blockBemClass = wrapperBemClass
          .elt('block')
          .mod('sticky')
          .mod({
            [blockStatus]: true,
            'all-above': blockIsAllOnPagesAbove,
            'all-below': blockIsAllOnPagesBelow,
            'some-above': blockIsOnSomePagesAbove,
            'some-below': blockIsOnSomePagesBelow
          })
        const blockClasses = [
          blockBemClass.value,
          styles['block'],
          styles['block_sticky'],
          styles[`status-${blockStatus}`],
          ...generateLayoutClasses('sticky', layout, mobileLayout)
        ]
        const blockStyle = {
          '--z-index': _zIndex,
          '--context-width': _context.width,
          '--context-height': _context.height,
          '--context-width-px': _context.width !== null
            ? `${_context.width}px`
            : undefined,
          '--context-height-px': _context.height !== null
            ? `${_context.height}px`
            : undefined,
          '--context-page': _context.page,
          '--context-progression': _context.progression,
          '--context-page-progression': _context.pageProgression
        }
        const blockDataAttributes = {
          'data-id': blockIdentifier,
          'data-context-width': _context.width,
          'data-context-height': _context.height,
          'data-context-page': _context.page,
          'data-context-progression': _context.progression,
          'data-context-page-progression': _context.pageProgression
        }
        return <div key={blockIdentifier}>
          <ResizeObserverComponent
            onResize={() => throttledHandleBlockResize()}>
            <div
              ref={n => { blocksRefsMap.set(blockIdentifier, n) }}
              className={blockClasses.join(' ')}
              style={blockStyle}
              {...blockDataAttributes}>
              <TransitionsWrapper
                isActive={blockStatus === 'current'}
                transitions={transitions}
                mobileTransitions={mobileTransitions}>
                {(() => {
                  const blockRef = blocksRefsMap.get(blockIdentifier)
                  if (blockRef === null) return null
                  if (blockRef === undefined) return null
                  return <BlockRenderer
                    type={type}
                    content={content}
                    context={_context}
                    cssLoader={loadCss} />
                })()}
              </TransitionsWrapper>
            </div>
          </ResizeObserverComponent>
        </div>
      })}
    </>
  }

  ScrollingBlocks () {
    const { generateLayoutClasses } = Scrollgneugneu
    const {
      props,
      state,
      blocksRefsMap,
      pagesRefsMap,
      wrapperBemClass,
      loadCss,
      isBlockSticky,
      getBlockStatus,
      handlePageChange,
      throttledHandleBlockResize
    } = this
    const {
      pages,
      blocks,
      currPagePos,
      prevPagePos
    } = state
    const sortedPagesArr = [...pages].sort(([aPos], [bPos]) => aPos - bPos)
    const lowestScrollingBlockZIndex = [...blocks.entries()]
      .filter(([blockId]) => !isBlockSticky(blockId))
      .reduce((acc, [_, blockData]) => {
        if (blockData._zIndex <= acc) return blockData._zIndex
        return acc
      }, Infinity)
    
    return <Paginator
      thresholdOffset={props.thresholdOffset}
      onPageChange={handlePageChange}
      className={styles['paginator']}
      style={{ '--z-index': lowestScrollingBlockZIndex }}
      ref={(n: Paginator) => { this.paginatorRef = n }}>
      {sortedPagesArr.map(([pagePos, pageData]) => {
        const scrollOrStickyPageBlocksData = [...pageData._blocksIds]
          .filter(id => !isBlockSticky(id))
          .map(id => blocks.get(id))
          .filter((b): b is StateBlockData => b !== undefined)
        const pageBlocksData = scrollOrStickyPageBlocksData as StateScrollBlockData[]
        const isCurrent = pagePos === currPagePos
        const isPrevious = pagePos === prevPagePos
        const isInactive = !isCurrent && !isPrevious
        const isAbove = currPagePos !== undefined && pagePos < currPagePos
        const isBelow = currPagePos !== undefined && pagePos > currPagePos
        const pageBemClass = wrapperBemClass
          .elt('page')
          .mod({
            current: isCurrent,
            previous: isPrevious,
            inactive: isInactive,
            above: isAbove,
            below: isBelow
          })
        return <Paginator.Page
          key={pageData.id ?? pagePos}
          value={pagePos}
          className={`${pageBemClass.value} ${styles['page']}`}
          pageRef={n => { pagesRefsMap.set(pagePos, n) }}>{
            pageBlocksData.map(blockData => {
              const { type, content, layout, mobileLayout } = blockData
              const blockStatus = getBlockStatus(blockData._id)
              const blockBemClass = wrapperBemClass
                .elt('block')
                .mod({
                  scrolling: true,
                  [blockStatus]: true,
                  above: isAbove,
                  below: isBelow
                })
              const blockClasses = [
                blockBemClass.value,
                styles['block'],
                styles['block_scrolling'],
                styles[`status-${blockStatus}`],
                ...generateLayoutClasses('scrolling', layout, mobileLayout)
              ]
              // [WIP] RSOComp adds complexity with its wrapper div, get rid of this
              return <ResizeObserverComponent
                onResize={throttledHandleBlockResize}>
                <div
                  key={blockData._id}
                  className={blockClasses.join(' ')}
                  data-id={blockData._id}
                  ref={node => blocksRefsMap.set(blockData._id, node)}
                  style={{ '--z-index': blockData._zIndex }}>
                  <BlockRenderer
                    type={type}
                    content={content}
                    cssLoader={loadCss} />
                </div>
              </ResizeObserverComponent>
            })
          }</Paginator.Page>
      })}
    </Paginator>
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * * * * */
  render () {
    // [WIP] TOO MANY RENDERS IT SEEMS
    const {
      props,
      state,
      wrapperBemClass,
      throttledBoundsDetection,
      getBgColorTransitionDuration,
      handlePaginatorResize,
      getCurrentPageData,
      injectModulesStyles,
      StickyBlocks,
      ScrollingBlocks
    } = this
    const {
      stickyBlocksViewportHeight,
      stickyBlocksOffsetTop,
      forceStickBlocks
    } = props
    const {
      scrollingPanelHeight,
      scrollingPanelWidth,
    } = state
    
    const currPageData = getCurrentPageData()

    // Detect if blocks must be fixed or offset
    const {
      topVisible = false,
      cntVisible = false,
      btmVisible = false
    } = state

    const blocksShouldStick = (cntVisible && !topVisible && !btmVisible)
      || (cntVisible && topVisible && (forceStickBlocks === 'before' || forceStickBlocks === 'both'))
    const blocksShouldOffset = (!blocksShouldStick && btmVisible)
      || (cntVisible && btmVisible && ((forceStickBlocks === 'after' || forceStickBlocks === 'both')))

    // Wrapper CSS classes
    const wrapperClasses = [
      wrapperBemClass
        .mod({ [`page-${currPageData?.id}`]: currPageData?.id ?? false })
        .value,
      styles['wrapper']
    ]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    if (blocksShouldStick) wrapperClasses.push(
      styles['wrapper_stick-blocks'],
      wrapperBemClass.mod('stick-blocks').value
    )
    if (blocksShouldOffset) wrapperClasses.push(
      styles['wrapper_offset-blocks'],
      wrapperBemClass.mod('offset-blocks').value
    )

    // Scroll panel CSS classes
    const scrollPanelBemClass = wrapperBemClass.element('scroll-panel')
    const scrollPanelClasses = [
      scrollPanelBemClass.value,
      styles['scroll-panel']
    ]

    // Modules css
    injectModulesStyles()
    
    // Return virtual DOM
    return <div
      className={wrapperClasses.join(' ')}
      style={{
        '--sticky-blocks-viewport-height': stickyBlocksViewportHeight ?? '100vh',
        '--sticky-blocks-offset-top': `${stickyBlocksOffsetTop ?? 0}px`,
        '--scrolling-block-height': `${scrollingPanelHeight}px`,
        '--scrolling-block-width': `${scrollingPanelWidth}px`,
        '--bg-color-transition-duration': getBgColorTransitionDuration(),
        '--bg-color': currPageData?.bgColor
      }}>

      {/* STICKY BLOCKS */}
      <StickyBlocks />

      {/* SCROLLING CONTENT */}
      <div className={scrollPanelClasses.join(' ')}>
        {/* TOP BOUND DETECTION */}
        <IntersectionObserverComponent
          render={<div ref={n => { this.topBoundRef = n }} />}
          callback={throttledBoundsDetection} />
        {/* CONTENT */}
        <IntersectionObserverComponent
          callback={throttledBoundsDetection}>
          <ResizeObserverComponent
            onResize={handlePaginatorResize}>
            <ScrollingBlocks />
          </ResizeObserverComponent>
        </IntersectionObserverComponent>
        {/* BOTTOM BOUND DETECTION */}
        <IntersectionObserverComponent
          render={<div ref={n => { this.btmBoundRef = n }} />}
          callback={throttledBoundsDetection} />
      </div>
    </div>
  }
}
