import { Component, toChildArray } from 'preact'

type Props = {
  onResize?: (entries: ResizeObserverEntry[]) => void
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
    const firstChild = children[0]
    if (firstChild === undefined) return
    this.observer.observe(firstChild)
  }

  render () {
    const { children } = this.props
    const childrenArr = toChildArray(children)
    // [WIP] not sure why single child is expected
    if (childrenArr.length !== 1) {
      console.error('ResizeObserverComponent expects a single child.')
      return <></>
    }
    // [WIP] not sure why wrapper is needed
    return <div
      className={`lm-resize-observer`}
      ref={n => { this.$root = n }}>
      {children}
    </div>
  }
}
