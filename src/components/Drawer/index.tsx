import { Component, JSX, createRef, RefObject } from 'preact'

import ResizeObserverComponent from '~/components/ResizeObserver'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

type State = {
  contentHeight: number | null
}

export type Props = {
  opened?: boolean
}

export default class Drawer extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> | null = null

  bemClss = bem('lm-drawer')

  constructor(props: Props) {
    super(props)

    this.contentRef = createRef()

    this.getContentHeight = this.getContentHeight.bind(this)
    this.setContentHeight = this.setContentHeight.bind(this)
  }

  componentDidMount(): void {
    this.setContentHeight()
  }

  componentDidUpdate(): void {
    this.setContentHeight()
  }

  getContentHeight(): number | null {
    if (this.contentRef === null) return null
    if (this.contentRef.current === null) return null

    const contentDimensions = this.contentRef.current.getBoundingClientRect()
    return contentDimensions.height
  }

  setContentHeight(): void {
    const contentHeight = this.getContentHeight()
    if (contentHeight === null) return
    if (contentHeight === this.state.contentHeight) return

    this.setState(curr => ({
      ...curr,
      contentHeight
    }))
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render() {
    const { props, state, bemClss } = this

    const wrapperClasses = [
      bemClss.mod({ 'is-open': props.opened }).value,
      styles['wrapper']
    ]
    if (props.opened) wrapperClasses.push(styles['wrapper_is-open'])

    const wrapperStyle = `--lm-drawer-content-height: ${state.contentHeight}px`

    return (
      <ResizeObserverComponent onResize={this.setContentHeight}>
        <div className={wrapperClasses.join(' ')} style={wrapperStyle}>
          <div ref={this.contentRef}>
            {props.children}
          </div>
        </div>
      </ResizeObserverComponent>
    )
  }
}
