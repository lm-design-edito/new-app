import { Component, JSX, VNode, CSSProperties } from 'preact'
import * as Bem from '@design-edito/tools/agnostic/css/bem';

export type IO = IntersectionObserver
export type IOE = IntersectionObserverEntry

type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

type Props = {
  customClass?: string
  style?: CSSProperties // [WIP] remove this
  render?: JSX.Element | ((ioEntry: IOE | null) => JSX.Element) // [WIP] this is doable via onIntersection and render props
  content?: string | VNode
  onIntersection?: (details: { ioEntry?: IOE | undefined, observer: IO }) => void
} & ObserverOptions

interface State {
  io_entry: IOE | null
}

class IntersectionObserverComponent extends Component<Props, State> {
  /* * * * * * * * * * * * * * *
   * PROPERTIES
   * * * * * * * * * * * * * * */
  mainClass: string = 'lm-intersection-observer'
  $root: HTMLDivElement | null = null
  $pRoot: HTMLDivElement | null = null
  observer: IO = new IntersectionObserver(this.observation)
  forceObservationTimeout1: number | null = null
  forceObservationTimeout2: number | null = null
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
    this.forceObservation = this.forceObservation.bind(this)
    this.forceObservationTimeout1 = window.setTimeout(() => this.forceObservation(), 100)
    this.forceObservationTimeout2 = window.setTimeout(() => this.forceObservation(), 500)
  }

  componentWillUnmount (): void {
    if (this.forceObservationTimeout1 !== null) window.clearTimeout(this.forceObservationTimeout1)
    if (this.forceObservationTimeout2 !== null) window.clearTimeout(this.forceObservationTimeout2)
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
    const thisEntry = entries[0]
    if (thisEntry === undefined) return this.setState({ io_entry: null })
    if (this.props.onIntersection !== undefined) this.props.onIntersection({ ioEntry: thisEntry, observer })
    this.setState({ io_entry: thisEntry })
  }

  forceObservation (): void {
    if (this.$root === null) return
    this.observer.unobserve(this.$root)
    this.observer.observe(this.$root)
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
    const classes = Bem
      .bem(this.mainClass)
      .mod({ 'is-intersecting': (state.io_entry?.isIntersecting ?? false) })
      .blk(props.customClass)
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
