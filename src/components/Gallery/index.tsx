import { Component, VNode } from 'preact'
import styles from './styles.module.scss'
import bem from '~/utils/bem'
import { throttle } from '~/utils/throttle-debounce'

export type Props = {
  customClass?: string
  itemsContent?: Array<string | VNode>
  prevButtonContent?: string | VNode
  nextButtonContent?: string | VNode
  snapScroll?: boolean
  scrollerWidth?: string
}

type State = {
  currentSlotPos: number
  isAtStart: boolean
  isAtEnd: boolean
}

export default class Gallery extends Component<Props, State> {
  $stateUpdaterTimeout: number | null = null
  $stateUpdaterInterval: number | null = null
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
    this.throttledHandleScroll = this.throttledHandleScroll.bind(this)
    this.getComputedPositions = this.getComputedPositions.bind(this)
    this.updateState = this.updateState.bind(this)
    this.resetScroll = this.resetScroll.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)
    this.$stateUpdaterInterval = window.setInterval(this.updateState.bind(this), 1000)
  }

  componentWillUnmount(): void {
    const intervalId = this.$stateUpdaterInterval
    const timeoutId = this.$stateUpdaterTimeout
    if (intervalId !== null) window.clearInterval(intervalId)
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }

  componentDidMount(): void {
    this.resetScroll()
    this.updateState()
    this.$stateUpdaterTimeout = window.setTimeout(() => {
      this.resetScroll()
      this.updateState()
    }, 50)
  }

  handleScroll () {
    this.throttledHandleScroll()
  }

  throttledHandleScroll = throttle(() => this.updateState(), 200).throttled

  getComputedPositions () {
    const { $scroller } = this
    if ($scroller === null) return;
    const slotsSizeData = this.$slots.map($slot => {
      if ($slot === null) return new DOMRect(0, 0, 0, 0)
      return $slot.getBoundingClientRect()
    }).reduce<Array<{
        clientRect: DOMRect
        width: number
        left: number
        right: number
        center: number
    }>>((reduced, clientRect) => {
      const prevReduced = reduced[reduced.length - 1]
      const width = clientRect.width ?? 0
      const left = (prevReduced?.left ?? 0) + (prevReduced?.width ?? 0)
      const right = left + width
      const center = (left + right) / 2
      return [...reduced, { width, left, right, center, clientRect }]
    }, [])
    const wrapperWidth = $scroller.clientWidth
    const wrapperScrollWidth = $scroller.scrollWidth
    const wrapperMaxScrollValue = wrapperScrollWidth - wrapperWidth
    const slotsWidth = slotsSizeData.reduce((red, curr) => (red + curr.width), 0)
    const computedScrollerWidth = slotsWidth - wrapperMaxScrollValue
    const currentScrollValue = $scroller.scrollLeft
    const slotsSizeDataWithDist = slotsSizeData.map(slotPosData => {
      const { center } = slotPosData
      const distanceToScrollerCenter = center - computedScrollerWidth / 2 - currentScrollValue
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
    const { getComputedPositions } = this
    const computedPositions = getComputedPositions() ?? {} as Partial<NonNullable<ReturnType<typeof getComputedPositions>>>
    const {
      slotsPositionData = [],
      currentScrollValue = 0,
      wrapperMaxScrollValue = 0
    } = computedPositions
    const indexOfCurrent = slotsPositionData.findIndex(slotPosData => slotPosData.isCurrent === true)
    const isAtStart = currentScrollValue <= 2 || indexOfCurrent <= 0
    const isAtEnd = (wrapperMaxScrollValue - currentScrollValue <= 2) || indexOfCurrent >= slotsPositionData.length - 1
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
    })
  }

  resetScroll () {
    const { $scroller } = this
    if ($scroller === null) return;
    $scroller.scrollLeft = 0
  }

  handleButtonClick (goForward: boolean = true) {
    // const { $scroller } = this
    // if ($scroller === null) return;
    // const scrollerWidth = $scroller.clientWidth
    // const targetForSnap = scrollerWidth / 2
    // const slotsPositionData = this.getComputedPositions()
    // if (slotsPositionData === undefined) return;
    // const snappedPos = slotsPositionData.findIndex(slot => slot.isSnapped === true)
    // const targetPos = goForward
    //   ? snappedPos + 1
    //   : snappedPos - 1
    // const targetSlotPositionData = slotsPositionData[targetPos]
    // if (targetSlotPositionData === undefined) return;
    // const { left: targetLeft, right: targetRight } = targetSlotPositionData.clientRect
    // const targetCenter = (targetLeft + targetRight) / 2
    // const snappedSlotPositionData = slotsPositionData[snappedPos]
    // let toScroll = 0
    // if (snappedSlotPositionData !== undefined) {
    //   const { left: snappedLeft, right: snappedRight } = snappedSlotPositionData.clientRect
    //   const snappedCenter = (snappedLeft + snappedRight) / 2
    //   const diff = snappedCenter - targetForSnap
    //   console.log(diff)
    //   if (diff > 0 === goForward && Math.abs(diff) > 5) { toScroll = diff }
    //   else { toScroll = targetCenter - targetForSnap }
    // } else { toScroll = targetCenter - targetForSnap }
    // $scroller.scrollLeft += toScroll
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
        style={{ backgroundColor: 'blue' }}
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
          return <div className={dotClasses.join(' ')}></div>
        })}
      </div>
    </div>
  }
}
