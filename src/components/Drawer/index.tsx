import { Component, createRef, RefObject, VNode } from 'preact'
import ResizeObserverComponent from '~/components/ResizeObserver'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  defaultState?: 'opened' | 'closed'
  content?: string | VNode
  topBarContent?: string | VNode
  topBarClosedContent?: string | VNode
  togglerContent?: string | VNode
  togglerClosedContent?: string | VNode
  transitionDuration?: string | number
  transitionCloseDuration?: string | number
  transitionEase?: string
  transitionCloseEase?: string
  onSomeEvent?: (payload: any) => void
}

type State = {
  contentHeight: number | null
  opened?: boolean
}

export default class Drawer extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> | null = null
  bemClss = bem('lm-drawer')

  constructor (props: Props) {
    super(props)
    this.contentRef = createRef()
    this.getContentHeight = this.getContentHeight.bind(this)
    this.storeContentHeight = this.storeContentHeight.bind(this)
    this.handleTogglerClick = this.handleTogglerClick.bind(this)
    this.state = {
      contentHeight: null,
      opened: !(props.defaultState === 'closed')
    }
  }

  componentDidMount (): void {
    this.storeContentHeight()
    window.setInterval(() => {
      this.storeContentHeight()
    }, 50)
  }

  componentDidUpdate (): void {
    this.storeContentHeight()
  }

  getContentHeight(): number | null {
    if (this.contentRef === null) return null
    if (this.contentRef.current === null) return null
    const contentDimensions = this.contentRef.current.getBoundingClientRect()
    return contentDimensions.height
  }

  storeContentHeight(): void {
    const contentHeight = this.getContentHeight()
    this.setState(curr => {
      if (contentHeight === null) return null
      if (curr.contentHeight === contentHeight) return null
      return { ...curr, contentHeight }
    })
  }

  handleTogglerClick () {
    this.setState(curr => ({
      ...curr,
      opened: !curr.opened
    }))
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render() {
    const { props, state, bemClss } = this
    const wrapperClasses = [bemClss.mod({ 'is-opened': state.opened }).value, styles['wrapper']]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    if (state.opened) wrapperClasses.push(styles['wrapper_is-opened'])
    const strDuration = typeof props.transitionDuration === 'number'
      ? `${props.transitionDuration}ms`
      : props.transitionDuration
    const strCloseDuration = typeof props.transitionCloseDuration === 'number'
    ? `${props.transitionCloseDuration}ms`
    : props.transitionCloseDuration
    const wrapperStyle = {
      '--content-height': `${state.contentHeight}px`,
      '--transition-duration': state.opened
        ? (strCloseDuration ?? strDuration)
        : strDuration,
      '--transition-easing': state.opened
        ? (props.transitionCloseEase ?? props.transitionEase)
        : props.transitionEase
    }
    const topBarClasses = [bemClss.elt('top-bar').value]
    const topBarTextClasses = [bemClss.elt('top-bar-text').value]
    const topBarTogglerClasses = [bemClss.elt('top-bar-toggler').value, styles['toggler']]
    const panelClasses = [bemClss.elt('panel').value, styles['panel']]
    const panelInnerClasses = [bemClss.elt('panel-inner').value]
    const topBarContent = state.opened
      ? (props.topBarContent ?? 'Drawer title')
      : (props.topBarClosedContent ?? props.topBarContent ?? 'Drawer title')
    const togglerContent = state.opened
      ? (props.togglerContent ?? '⤒')
      : (props.topBarClosedContent ?? props.togglerContent ?? '⤓')
    const topBoundaryClasses = [bemClss.elt('boundary').mod('top').value, styles['boundary']]
    const btmBoundaryClasses = [bemClss.elt('boundary').mod('bottom').value, styles['boundary']]
    return <div
      style={wrapperStyle}
      className={wrapperClasses.join(' ')}>
      <div className={topBarClasses.join(' ')}>
        <span className={topBarTextClasses.join(' ')}>
          {topBarContent}
        </span>
        <button
          onClick={this.handleTogglerClick}
          className={topBarTogglerClasses.join(' ')}>
          {togglerContent}
        </button>
      </div>
      <div className={panelClasses.join(' ')}>
        <ResizeObserverComponent onResize={this.storeContentHeight}>
          <div ref={this.contentRef} className={panelInnerClasses.join(' ')}>
            <div className={topBoundaryClasses.join(' ')}></div>
            {props.children}
            {props.content}
            <div className={btmBoundaryClasses.join(' ')}></div>
          </div>
        </ResizeObserverComponent>
      </div>
    </div>
  }
}
