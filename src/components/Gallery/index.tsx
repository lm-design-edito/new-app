import { Component, VNode } from 'preact'
import bem from '~/utils/bem'
import { throttle } from '~/utils/throttle-debounce'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  itemsContent?: Array<string | VNode>
  prevButtonContent?: string | VNode
  nextButtonContent?: string | VNode
  snapScroll?: boolean
  scrollerWidth?: string
  onSlideChange?: (payload: State) => void
  onPrevClick?: (payload: State) => void
  onNextClick?: (payload: State) => void
  onDotClick?: (payload: State & { dotPos: number }) => void
}

export type State = {
  currentSlotPos: number
  isAtStart: boolean
  isAtEnd: boolean
}

export default class Gallery extends Component<Props, State> {
  stateUpdaterTimeout: number | null = null
  stateUpdaterInterval: number | null = null
  $scroller: HTMLDivElement | null = null
  $slots: Array<HTMLDivElement | null> = []
  state: State = {
    currentSlotPos: -1,
    isAtStart: true,
    isAtEnd: true
  }

  constructor (props: Props) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
    this.throttledUpdateState = this.throttledUpdateState.bind(this)
    this.getComputedPositions = this.getComputedPositions.bind(this)
    this.updateState = this.updateState.bind(this)
    this.resetScroll = this.resetScroll.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)
    this.setCurrentPage = this.setCurrentPage.bind(this)
    this.stateUpdaterInterval = window.setInterval(this.updateState.bind(this), 1000)
  }

  componentWillUnmount(): void {
    const intervalId = this.stateUpdaterInterval
    const timeoutId = this.stateUpdaterTimeout
    if (intervalId !== null) window.clearInterval(intervalId)
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }

  componentDidMount(): void {
    this.resetScroll()
    this.updateState()
    this.stateUpdaterTimeout = window.setTimeout(() => {
      this.resetScroll()
      this.updateState()
    }, 100)
    ;(window as any).lol = this.getComputedPositions
    ;(window as any).scroller = this.$scroller
  }

  getComputedPositions () {
    const { $scroller } = this
    if ($scroller === null) return;
    const slotsDomRects = this.$slots.map($slot => $slot?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0))
    const wrapperRects = $scroller.getBoundingClientRect()
    const wrapperLeft = wrapperRects.left
    const wrapperRight = wrapperRects.right
    const wrapperCenter = (wrapperLeft + wrapperRight) / 2
    const wrapperWidth = $scroller.getBoundingClientRect().width
    const wrapperScrollWidth = $scroller.scrollWidth
    const wrapperMaxScrollValue = wrapperScrollWidth - wrapperWidth
    const currentScrollValue = $scroller.scrollLeft
    const slotsSizeDataWithDist = slotsDomRects.map(slotPosData => {
      const { left, right } = slotPosData
      const center = (left + right) / 2
      const distanceToScrollerCenter = center - wrapperCenter
      return { ...slotPosData, distanceToScrollerCenter }
    })
    const minDistance = Math.min(...slotsSizeDataWithDist.map(e => Math.abs(e.distanceToScrollerCenter)))
    const slotsPositionData = slotsSizeDataWithDist.map(slotPosData => ({
      ...slotPosData,
      isCurrent: Math.abs(slotPosData.distanceToScrollerCenter) === minDistance
    }))
    return {
      slotsPositionData,
      currentScrollValue,
      wrapperScrollWidth,
      wrapperWidth,
      wrapperMaxScrollValue
    }
  }

  updateState () {
    const { getComputedPositions, props } = this
    const computedPositions = getComputedPositions() ?? {} as Partial<NonNullable<ReturnType<typeof getComputedPositions>>>
    const {
      slotsPositionData = [],
      currentScrollValue = 0,
      wrapperMaxScrollValue = 0
    } = computedPositions
    const indexOfCentered = slotsPositionData.findIndex(slotPosData => slotPosData.isCurrent === true)
    const isAtStart = currentScrollValue <= 2 || indexOfCentered <= 0
    const isAtEnd = (wrapperMaxScrollValue - currentScrollValue <= 2) || indexOfCentered >= slotsPositionData.length - 1
    let indexOfCurrent: number
    // [WIP] should not fallback on 0 and length, but last unsnappable to the left, and first unsnappable to the right
    if (isAtStart) { indexOfCurrent = 0 }
    else if (isAtEnd) { indexOfCurrent = slotsPositionData.length - 1 }
    else { indexOfCurrent = indexOfCentered }
    this.setState(curr => {
      if (curr.currentSlotPos === indexOfCurrent
        && curr.isAtStart === isAtStart
        && curr.isAtEnd === isAtEnd) return null
      return {
        ...curr,
        currentSlotPos: indexOfCurrent,
        isAtStart,
        isAtEnd
      }
    }, () => {
      const { onSlideChange } = props
      if (onSlideChange !== undefined) onSlideChange({ ...this.state })
    })
  }

  throttledUpdateState = throttle(() => this.updateState(), 200).throttled

  handleScroll () {
    this.throttledUpdateState()
  }

  resetScroll () {
    const { $scroller } = this
    if ($scroller === null) return;
    $scroller.scrollLeft = 0
  }

  setCurrentPage (position: number) {
    const { getComputedPositions, $scroller } = this
    if ($scroller === null) return;
    const computedPositions = getComputedPositions()
    if (computedPositions === undefined) return;
    const { slotsPositionData } = computedPositions
    const targetElement = slotsPositionData?.[position]
    if (targetElement === undefined) return;
    console.log(targetElement.distanceToScrollerCenter, computedPositions)
    const { distanceToScrollerCenter } = targetElement
    $scroller.scrollLeft += distanceToScrollerCenter
  }

  handleButtonClick (goForward: boolean = true) {
    const { props, state, setCurrentPage } = this
    const { currentSlotPos } = state
    const targetPosition = goForward ? currentSlotPos + 1 : currentSlotPos - 1
    setCurrentPage(targetPosition)
    const { onPrevClick, onNextClick } = props
    if (goForward && onNextClick !== undefined) onNextClick({ ...this.state })
    if (!goForward && onPrevClick !== undefined) onPrevClick({ ...this.state })
  }

  render () {
    const { props, state } = this
    const rootClass = 'lm-gallery'
    const wrapperBemClass = bem(rootClass).mod({
      'snap-scroll': props.snapScroll,
      'is-at-start': state.isAtStart,
      'is-at-end': state.isAtEnd
    })
    const wrapperClasses = [wrapperBemClass.value, styles['wrapper']]
    if (props.snapScroll) wrapperClasses.push(styles['wrapper_snap'])
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    const wrapperStyle = { '--scroller-width': props.scrollerWidth }
    const scrollerBemClass = bem(rootClass).elt('scroller')
    const scrollerClasses = [scrollerBemClass.value, styles['scroller']]
    const buttonBemClass = bem(rootClass).elt('button')
    const buttonClasses = [buttonBemClass.value]
    const prevButtonClasses = [buttonBemClass.mod('prev').value, ...buttonClasses]
    const nextButtonClasses = [buttonBemClass.mod('next').value, ...buttonClasses]
    const dotsBemClass = bem(rootClass).elt('dots')
    const dotsClasses = [dotsBemClass.value]
    return <div
      style={wrapperStyle}
      className={wrapperClasses.join(' ')}>
      <div
        ref={n => { this.$scroller = n }}
        className={scrollerClasses.join(' ')}
        onScroll={this.handleScroll}>
        {props.itemsContent?.map((itemContent, itemPos) => {
          const slotBemClass = bem(rootClass)
            .elt('slot')
            .mod({ current: itemPos === state.currentSlotPos })
          const slotClasses = [slotBemClass.value, styles['slot']]
          return <div
            ref={n => { this.$slots[itemPos] = n; }}
            className={slotClasses.join(' ')}>
            {itemContent}
          </div>
        })}
      </div>
      <button
        onClick={() => this.handleButtonClick(false)}
        className={prevButtonClasses.join(' ')}>
        {props.prevButtonContent}
      </button>
      <button
        onClick={() => this.handleButtonClick(true)}
        className={nextButtonClasses.join(' ')}>
        {props.nextButtonContent}
      </button>
      <div className={dotsClasses.join(' ')}>
        {props.itemsContent?.map((_, itemPos) => {
          const dotBemClass = bem(rootClass).elt('dot').mod({ current: itemPos === state.currentSlotPos })
          const dotClasses = [dotBemClass.value]
          const handler = () => {
            const { onDotClick } = props
            this.setCurrentPage(itemPos)
            if (onDotClick !== undefined) onDotClick({ ...this.state, dotPos: itemPos })
          }
          return <div className={dotClasses.join(' ')} onClick={handler} />
        })}
      </div>
    </div>
  }
}
