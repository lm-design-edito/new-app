import { Component, JSX, toChildArray, cloneElement } from 'preact'
import bem from '~/utils/bem'
import { groupDelay } from '~/utils/group-delay' // [WIP] throttle would be better
import Page, { Props as PageProps } from './Page'
import styles from './styles.module.scss'

export interface PagePositionAndValue {
  position: number
  value?: any
}

export interface Props {
  className?: string
  style?: JSX.CSSProperties
  root?: 'self'|'window'
  direction?: 'horizontal'|'vertical'
  thresholdOffset?: string
  // [WIP] delay and intervalcheck should be a single prop
  delay?: number
  intervalCheck?: boolean
  onPageChange?: (state: State) => void
}

export interface State {
  passed: PagePositionAndValue[]
  active: PagePositionAndValue[]
  coming: PagePositionAndValue[]
  direction: 'forwards'|'backwards'|null
  value: any
  position: number|null
}

export default class Paginator extends Component<Props, State> {
  static Page = Page
  static clss = 'lm-paginator'
  clss = Paginator.clss
  state: State = {
    passed: [],
    active: [],
    coming: [],
    direction: null,
    value: undefined,
    position: null
  }
  childrenRefs: Page[] = []
  $thresholdBar: HTMLDivElement|null = null
  $scrollableArea: HTMLDivElement|null = null
  intervalChecker: number|null = null

  /* * * * * * * * * * * * * * *
   * CONSTRUCTOR & LIFECYCLE
   * * * * * * * * * * * * * * */
  constructor (props: Props) {
    super(props)
    this.getDelay = this.getDelay.bind(this)
    this.checkPages = this.checkPages.bind(this)
    this.wrapChildrenInPages = this.wrapChildrenInPages.bind(this)
    this.getThresholdBarBoundingClientRect = this.getThresholdBarBoundingClientRect.bind(this)
    this.activateIntervalChecker = this.activateIntervalChecker.bind(this)
    this.inactivateIntervalChecker = this.inactivateIntervalChecker.bind(this)
  }

  componentDidMount (): void {
    this.groupedCheckPages()
    if (this.props.intervalCheck === true) this.activateIntervalChecker()
    window.addEventListener('scroll', this.groupedCheckPages)
    window.addEventListener('resize', this.groupedCheckPages)
    if (this.$scrollableArea !== null) this.$scrollableArea.addEventListener('scroll', this.groupedCheckPages)
  }

  componentDidUpdate (prevProps: Props): void {
    this.groupedCheckPages()
    const pIntervalCheck = prevProps.intervalCheck
    const intervalCheck = this.props.intervalCheck
    if (pIntervalCheck === intervalCheck) return
    if (intervalCheck === true) this.activateIntervalChecker()
    else this.inactivateIntervalChecker()
  }

  componentWillUnmount (): void {
    this.inactivateIntervalChecker()
    window.removeEventListener('scroll', this.groupedCheckPages)
    window.removeEventListener('resize', this.groupedCheckPages)
    if (this.$scrollableArea !== null) this.$scrollableArea.removeEventListener('scroll', this.groupedCheckPages)
  }

  /* * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * */
  getDelay (): number {
    return this.props.delay ?? 100
  }

  wrapChildrenInPages (): JSX.Element[] {
    const { children } = this.props
    this.childrenRefs = []
    const clonedChildren = toChildArray(children).map((child, childPos) => {
      const ref = (node: any): void => { this.childrenRefs[childPos] = node }
      if (typeof child === 'object' && child.type === Page) {
        return cloneElement(
          child, {
            ref,
            value: (child.props as PageProps).value ?? childPos,
            position: childPos
          }) as JSX.Element
      } else {
        return <Page
          ref={ref}
          value={childPos}
          position={childPos}>
          {child}
        </Page>
      }
    })
    return clonedChildren
  }

  getThresholdBarBoundingClientRect () {
    const { $thresholdBar } = this
    if ($thresholdBar === null) return
    return $thresholdBar.getBoundingClientRect()
  }

  checkPages (): void {
    const thresholdBarRect = this.getThresholdBarBoundingClientRect()
    if (thresholdBarRect === undefined) return

    const passedChildrenRefs = this.childrenRefs.filter(childRef => {
      const childRect = childRef.getRect()
      if (childRect === null) return false
      return (this.props.direction === 'horizontal')
        ? childRect.x + childRect.width < thresholdBarRect.x
        : childRect.y + childRect.height < thresholdBarRect.y
    })

    const comingChildrenRefs = this.childrenRefs.filter(childRef => {
      const childRect = childRef.getRect()
      if (childRect === null) return false
      return (this.props.direction === 'horizontal')
        ? childRect.x > thresholdBarRect.x
        : childRect.y > thresholdBarRect.y
    })

    const activeChildrenRefs = this.childrenRefs.filter(childRef => {
      const childRect = childRef.getRect()
      if (childRect === null) return false
      return (this.props.direction === 'horizontal')
        ? childRect.x <= thresholdBarRect.x && childRect.x + childRect.width >= thresholdBarRect.x
        : childRect.y <= thresholdBarRect.y && childRect.y + childRect.height >= thresholdBarRect.y
    })

    this.setState(curr => {
      const currPassedStr = curr.passed.sort(e => e.position).map(e => `${e.position}`).join(',')
      const currActiveStr = curr.active.sort(e => e.position).map(e => `${e.position}`).join(',')
      const currComingStr = curr.coming.sort(e => e.position).map(e => `${e.position}`).join(',')

      const passedStr = passedChildrenRefs.sort(ref => ref.props.position ?? 0).map(ref => `${ref.props.position ?? 0}`).join(',')
      const activeStr = activeChildrenRefs.sort(ref => ref.props.position ?? 0).map(ref => `${ref.props.position ?? 0}`).join(',')
      const comingStr = comingChildrenRefs.sort(ref => ref.props.position ?? 0).map(ref => `${ref.props.position ?? 0}`).join(',')

      if (currPassedStr === passedStr
        && currActiveStr === activeStr
        && currComingStr === comingStr) return null

      const passed = passedChildrenRefs.map(ref => ({ position: ref.props.position ?? 0, value: ref.props.value })).sort(e => e.position)
      const active = activeChildrenRefs.map(ref => ({ position: ref.props.position ?? 0, value: ref.props.value })).sort(e => e.position)
      const coming = comingChildrenRefs.map(ref => ({ position: ref.props.position ?? 0, value: ref.props.value })).sort(e => e.position)
      const value = active[0]?.value
      const position = (active[0]?.position ?? null) as any|null

      let direction: 'forwards'|'backwards'|null = null

      if (curr.passed.length < passed.length) { direction = 'forwards' }
      else if (curr.passed.length > passed.length) { direction = 'backwards' }
      else if (curr.passed.length === passed.length) {
        if (curr.coming.length > coming.length) { direction = 'forwards' }
        else if (curr.coming.length < coming.length) { direction = 'backwards' }
      }

      const newState: State = {
        passed,
        active,
        coming,
        direction,
        value,
        position
      }

      if (this.props.onPageChange !== undefined) {
        this.props.onPageChange(newState)
      }
      return newState
    })
  }

  groupedCheckPages = groupDelay(
    this.checkPages.bind(this),
    this.getDelay.bind(this)()
  )

  activateIntervalChecker (): void {
    this.inactivateIntervalChecker()
    this.intervalChecker = window.setInterval(
      this.groupedCheckPages,
      this.getDelay()
    )
  }

  inactivateIntervalChecker (): void {
    if (this.intervalChecker === null) return
    window.clearInterval(this.intervalChecker)
    this.intervalChecker = null
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element {
    const { props } = this

    /* Classes and style */
    const wrapperBemClasses = bem(props.className)
      .block(this.clss)
      .mod({
        horizontal: props.direction === 'horizontal',
        vertical: props.direction !== 'horizontal',
        'self-rooted': props.root === 'self',
        'window-rooted': props.root !== 'self'
      })
    const wrapperClasses = [
      wrapperBemClasses.value,
      styles['wrapper']
    ]
    if (props.direction === 'horizontal') wrapperClasses.push(styles['wrapper_horizontal'])
    if (props.direction !== 'horizontal') wrapperClasses.push(styles['wrapper_vertical'])
    if (props.root === 'self') wrapperClasses.push(styles['wrapper_self-rooted'])
    if (props.root !== 'self') wrapperClasses.push(styles['wrapper_window-rooted'])
    const thresholdAreaClasses = [
      bem(this.clss).elt('threshold-area').value,
      styles['threshold-area']
    ]
    const thresholdBarClasses = [
      bem(this.clss).elt('threshold-bar').value,
      styles['threshold-bar']
    ]
    const scrollableAreaClasses = [
      bem(this.clss).elt('scrollable-area').value,
      styles['scrollable-area']
    ]
    const wrapperStyle: JSX.CSSProperties = {
      ...props.style,
      '--threshold-offset': props.thresholdOffset ?? 0
    }

    /* Display */
    return (
      <div
        className={wrapperClasses.join(' ')}
        style={wrapperStyle}>
        <div className={thresholdAreaClasses.join(' ')}>
          <div
            ref={n => { this.$thresholdBar = n }}
            className={thresholdBarClasses.join(' ')} />
        </div>
        <div
          ref={n => { this.$scrollableArea = n }}
          className={scrollableAreaClasses.join(' ')}>
          {this.wrapChildrenInPages()}
        </div>
      </div>
    )
  }
}
