import { Component, JSX } from 'preact'
import bem from '~/utils/bem'

interface Props {
  className?: string
  style?: JSX.CSSProperties
  value?: any
  position?: number
  pageRef?: (node: HTMLDivElement|null) => void
}

class Page extends Component<Props, {}> {
  static clss = 'lm-paginator-page'
  clss = Page.clss
  $root: HTMLDivElement|null = null

  /* * * * * * * * * * * * * * *
   * CONSTRUCTOR
   * * * * * * * * * * * * * * */
  constructor (props: Props) {
    super(props)
    this.getRect = this.getRect.bind(this)
  }

  /* * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * */
  getRect (): DOMRect|null {
    if (this.$root === null) return null
    return this.$root.getBoundingClientRect()
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props } = this
    const { pageRef } = props

    /* Classes and style */
    const wrapperClasses = [bem(props.className).block(this.clss).value]
    const wrapperStyle: JSX.CSSProperties = { ...props.style }

    /* Display */
    return (
      <div
        ref={n => {
          this.$root = n
          if (pageRef !== undefined) pageRef(n)
        }}
        style={wrapperStyle}
        className={wrapperClasses.join(' ')}>
        {props.children}
      </div>
    )
  }
}

export type { Props }
export default Page
