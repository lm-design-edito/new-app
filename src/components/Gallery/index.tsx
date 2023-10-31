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
  snappedSlotPos: number
  isAtStart: boolean
  isAtEnd: boolean
}

export default class Gallery extends Component<Props, State> {
  $scroller: HTMLDivElement | null = null
  $slots: Array<HTMLDivElement | null> = []
  state: State = {
    currentSlotPos: -1,
    snappedSlotPos: -1,
    isAtStart: true,
    isAtEnd: true
  }

  constructor (props: Props) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
    this.throttledHandleScroll = this.throttledHandleScroll.bind(this)
    this.getSlotsPositionData = this.getSlotsPositionData.bind(this)
    this.updateState = this.updateState.bind(this)
    this.resetScroll = this.resetScroll.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)
  }

  componentDidMount(): void {
    this.resetScroll()
    this.updateState()
  }

  handleScroll () {
    this.throttledHandleScroll()
  }

  throttledHandleScroll = throttle(() => this.updateState(), 200).throttled

  getSlotsPositionData () {
    const { $scroller } = this
    if ($scroller === null) return;
    const scrollerWidth = $scroller.clientWidth
    const maxScrollValue = $scroller.scrollWidth - scrollerWidth
    const currentScrollValue = $scroller.scrollLeft
    const scrolledRatio = currentScrollValue / maxScrollValue
    const slotsPositionData = this.$slots
      .map($slot => {
        if ($slot === null) return { clientRect: new DOMRect(0, 0, 0, 0) }
        return { clientRect: $slot.getBoundingClientRect() }
      }).reduce<Array<{
        clientRect: DOMRect
        width: number
        left: number
        right: number
      }>>((reduced, currElt) => {
        const prevReduced = reduced[reduced.length - 1] ?? { width: 0, left: 0, clientRect: new DOMRect(0, 0, 0, 0) }
        const width = currElt?.clientRect.width ?? 0
        const left = prevReduced.left + prevReduced.width
        const right = left + width
        return [...reduced, { width, left, right, ...currElt }]
      }, [])
      .map((slotData, _, slots) => {
        const lastSlotData = slots[slots.length - 1] ?? { right: 0 }
        const totalSlotsWidth = lastSlotData.right
        const targetForCurrent = totalSlotsWidth * scrolledRatio
        const isCurrent = (slotData.left <= targetForCurrent)
          && (slotData.right >= targetForCurrent)
        const targetForSnapped = scrollerWidth / 2
        const { clientRect } = slotData
        const isSnapped = (clientRect.left <= targetForSnapped) && (clientRect.right >= targetForSnapped)
        return { ...slotData, isCurrent, isSnapped }
      })
    return slotsPositionData
  }

  updateState () {
    const slotsPositionData = this.getSlotsPositionData() ?? []
    const indexOfCurrent = slotsPositionData.findIndex(slotPosData => slotPosData.isCurrent === true)
    const indexOfSnapped = slotsPositionData.findIndex(slotPosData => slotPosData.isSnapped === true)
    const { $scroller } = this
    const scrollerScrolled = $scroller?.scrollLeft ?? 0
    const scrollerScrollWidth = $scroller?.scrollWidth ?? 0
    const scrollerWidth = $scroller?.clientWidth ?? 0
    const scrollerScrollMax = scrollerScrollWidth - scrollerWidth ?? 0
    const isAtStart = scrollerScrolled <= 2
    const isAtEnd = (scrollerScrollMax - scrollerScrolled) <= 2
    this.setState(curr => {
      if (curr.currentSlotPos === indexOfCurrent
        && curr.snappedSlotPos === indexOfSnapped
        && curr.isAtStart === isAtStart
        && curr.isAtEnd === isAtEnd) return null
      return {
        ...curr,
        currentSlotPos: indexOfCurrent,
        snappedSlotPos: this.props.snapScroll ? indexOfSnapped : -1,
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
    const { $scroller } = this
    if ($scroller === null) return;
    const scrollerWidth = $scroller.clientWidth
    const targetForSnap = scrollerWidth / 2
    const slotsPositionData = this.getSlotsPositionData()
    if (slotsPositionData === undefined) return;
    const snappedPos = slotsPositionData.findIndex(slot => slot.isSnapped === true)
    const targetPos = goForward
      ? snappedPos + 1
      : snappedPos - 1
    const targetSlotPositionData = slotsPositionData[targetPos]
    if (targetSlotPositionData === undefined) return;
    const { left: targetLeft, right: targetRight } = targetSlotPositionData.clientRect
    const targetCenter = (targetLeft + targetRight) / 2
    const snappedSlotPositionData = slotsPositionData[snappedPos]
    let toScroll = 0
    if (snappedSlotPositionData !== undefined) {
      const { left: snappedLeft, right: snappedRight } = snappedSlotPositionData.clientRect
      const snappedCenter = (snappedLeft + snappedRight) / 2
      const diff = snappedCenter - targetForSnap
      if (diff > 0 === goForward && Math.abs(diff) > 5) { toScroll = diff }
      else { toScroll = targetCenter - targetForSnap }
    } else { toScroll = targetCenter - targetForSnap }
    $scroller.scrollLeft += toScroll
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
    return <div
      style={wrapperStyle}
      className={wrapperClasses.join(' ')}>
      <div
        ref={n => { this.$scroller = n }}
        className={scrollerClasses.join(' ')}
        onScroll={this.handleScroll}>
        {props.itemsContent?.map((itemContent, itemPos) => {
          const slotBemClass = bem(rootClass).elt('slot').mod({
            current: itemPos === state.currentSlotPos,
            snapped: itemPos === state.snappedSlotPos
          })
          const slotClasses = [slotBemClass.value, styles['slot']]
          return <div
            ref={n => { this.$slots[itemPos] = n }}
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
    </div>
  }
}
