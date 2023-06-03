import { Component, createRef, RefObject } from 'preact'
import ResizeObserverComponent from '~/components/ResizeObserver'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

type State = { contentHeight: number | null }
export type Props = { opened?: boolean }

export default class Drawer extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> | null = null
  bemClss = bem('lm-drawer')

  constructor (props: Props) {
    super(props)
    this.contentRef = createRef()
    this.getContentHeight = this.getContentHeight.bind(this)
    this.storeContentHeight = this.storeContentHeight.bind(this)
  }

  componentDidMount (): void {
    this.storeContentHeight()
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
    if (contentHeight === null) return
    if (contentHeight === this.state.contentHeight) return
    this.setState(curr => {
      if (curr.contentHeight === contentHeight) return null
      return { ...curr, contentHeight }
    })
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render() {
    const { props, state, bemClss } = this
    const wrapperClasses = [
      bemClss.mod({ 'is-opened': props.opened }).value,
      styles['wrapper']
    ]
    if (props.opened) wrapperClasses.push(styles['wrapper_is-opened'])
    const wrapperStyle = { '--content-height': `${state.contentHeight}px` }
    return <ResizeObserverComponent onResize={this.storeContentHeight}>
      <div  
        style={wrapperStyle}
        className={wrapperClasses.join(' ')}>
        <div
          ref={this.contentRef}
          className={bemClss.elt('inner').value}>
          {props.children}
        </div>
      </div>
    </ResizeObserverComponent>
  }
}
