import { Component, VNode } from 'preact'

export type Props = {
  content?: string | VNode,
  onResize?: (entries: ResizeObserverEntry[]) => void,
}

export default class ResizeObserverComponent extends Component<Props> {
  $root: HTMLDivElement|null = null
  observer: ResizeObserver|null = null

  componentDidMount () {
    if (this.$root === null) return
    this.createObserver()
  }

  componentDidUpdate(previousProps: Readonly<Props>): void {
    const pOnResize = previousProps.onResize
    const { onResize } = this.props
    if (pOnResize !== onResize) this.createObserver()
  }

  componentWillUnmount(): void {
    this.observer?.disconnect()
  }

  createObserver () {
    const { props, $root } = this
    this.observer?.disconnect()
    if ($root === null) return
    this.observer = new ResizeObserver(entries => {
      const { onResize } = props
      if (onResize === undefined) return
      onResize(entries)
    })
    const { children } = $root
    Array.from(children).forEach((child) => {
      this.observer?.observe(child)
    })
  }

  render () {
    const { children, content } = this.props
    return <div
      className={`lm-resize-observer`}
      ref={n => { this.$root = n }}>
      {children}
      {content}
    </div>
  }
}
