import { Component, JSX, VNode } from 'preact'
import bem from '~/utils/bem'

export type IO = IntersectionObserver
export type IOE = IntersectionObserverEntry

type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

type Props = {
  customClass?: string
  style?: JSX.CSSProperties // [WIP] remove this
  render?: JSX.Element | ((ioEntry: IOE | null) => JSX.Element) // [WIP] this is doable via onIntersection and render props
  content?: string | VNode
  onIntersection?: (details: { ioEntry?: IOE | undefined, observer: IO }) => void
} & ObserverOptions

interface State {
  io_entry: IOE|null
}

class IntersectionObserverComponent extends Component<Props, State> {
  /* * * * * * * * * * * * * * *
   * PROPERTIES
   * * * * * * * * * * * * * * */
  mainClass: string = 'lm-intersection-observer'
  $root: HTMLDivElement | null = null
  $pRoot: HTMLDivElement | null = null
  observer: IO = new IntersectionObserver(this.observation)
  state: State = {
    io_entry: null
  }

  /* * * * * * * * * * * * * * *
   * CONSTRUCTOR
   * * * * * * * * * * * * * * */
  constructor (props: Props) {
    super(props)
    this.getObserverOptions = this.getObserverOptions.bind(this)
    this.updateObserver = this.updateObserver.bind(this)
    this.observation = this.observation.bind(this)
  }

  /* * * * * * * * * * * * * * *
   * LIFECYCLE
   * * * * * * * * * * * * * * */
  componentDidMount (): void {
    this.$pRoot = this.$root
    this.updateObserver()
  }

  componentDidUpdate (prevProps: Props): void {
    const shouldUpdateObserver = prevProps.root !== this.props.root
      || prevProps.rootMargin !== this.props.rootMargin
      || prevProps.threshold?.toString() !== this.props.threshold?.toString()
      || this.$pRoot !== this.$root
    if (shouldUpdateObserver) this.updateObserver()
    if (this.$pRoot !== this.$root) this.$pRoot = this.$root
  }

  /* * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * */
  getObserverOptions (): ObserverOptions {
    return {
      root: this.props.root,
      rootMargin: this.props.rootMargin,
      threshold: this.props.threshold
    }
  }

  updateObserver (): void {
    const options = this.getObserverOptions()
    this.observer.disconnect()
    this.observer = new IntersectionObserver(this.observation, options)
    if (this.$root === null) return console.warn('this.$root should not be null')
    this.observer.observe(this.$root)
  }

  observation (entries: IOE[], observer: IO): void {
    if (this.props.onIntersection !== undefined) this.props.onIntersection({ ioEntry: entries[0], observer })
    this.setState({ io_entry: entries[0] })
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props, state } = this

    // Logic
    const rendered = props.render !== undefined
      ? (typeof props.render === 'function'
        ? props.render(state.io_entry)
        : props.render)
      : null

    // Classes
    const classes = bem(this.mainClass).blk(props.customClass)
    const inlineStyle = { ...props.style }

    // Display
    return <div
      ref={$n => { this.$root = $n }}
      className={classes.value}
      style={inlineStyle}>
      {rendered}
      {props.children}
      {props.content}
    </div>
  }
}

export type { Props, State }
export default IntersectionObserverComponent
