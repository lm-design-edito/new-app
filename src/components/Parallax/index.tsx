console.error('Parallax component use is deprecated')

export default (props: any) => <div>
  Parallax component.
</div>

// import { Component, ComponentChild, JSX } from 'preact'
// import clss from 'classnames'
// import './styles.css'

// interface Props {
//   className?: string
//   style?: JSX.CSSProperties
//   anchor?: string|number
//   render?: (p: number) => ComponentChild
// }

// interface State {
//   isIntersecting: boolean
//   scrollPercent: number
// }

// type IO = IntersectionObserver
// type IOE = IntersectionObserverEntry

// class Parallax extends Component<Props, State> {
//   mainClass: string = 'lm-parallax'
//   state = {
//     isIntersecting: false,
//     scrollPercent: 0
//   }
//   $root: HTMLDivElement|null = null
//   $observed: HTMLDivElement|null = null
//   observer: IO = new IntersectionObserver((entries: IOE[]) => this.visibilityObservation(entries, this))

//   /* * * * * * * * * * * * * * *
//    * CONSTRUCTOR
//    * * * * * * * * * * * * * * */
//   constructor (props: Props) {
//     super(props)
//     this.visibilityObservation = this.visibilityObservation.bind(this)
//     this.scrollListening = this.scrollListening.bind(this)
//   }

//   /* * * * * * * * * * * * * * *
//    * LIFECYCLE
//    * * * * * * * * * * * * * * */
//   componentDidMount (): void {
//     if (this.$root === null) return
//     this.$observed = this.$root
//     this.observer.observe(this.$observed)
//     this.scrollListening()
//   }

//   componentDidUpdate (): void {
//     const { isIntersecting } = this.state
//     const { addEventListener, removeEventListener } = window
//     if (isIntersecting) addEventListener('scroll', this.scrollListening)
//     else removeEventListener('scroll', this.scrollListening)
//     if (
//       this.$observed !== null
//       && this.$root !== null
//       && this.$observed !== this.$root) {
//       this.observer.unobserve(this.$observed)
//       this.$observed = this.$root
//       this.observer.observe(this.$root)
//     }
//   }

//   componentWillUnmount (): void {
//     if (this.$observed !== null) {
//       this.observer.unobserve(this.$observed)
//     }
//   }

//   /* * * * * * * * * * * * * * *
//    * VISIBILITY OBSERVATION
//    * * * * * * * * * * * * * * */
//   visibilityObservation (entries: IOE[], that: Parallax): void {
//     const entry = entries[0]
//     if (entry === undefined) return
//     if (entry.isIntersecting) return that.setState({ isIntersecting: true })
//     return that.setState({ isIntersecting: false })
//   }

//   /* * * * * * * * * * * * * * *
//    * SCROLL LISTENING
//    * * * * * * * * * * * * * * */
//   scrollListening (): void {
//     if (this.$root === null) return
//     const rootDomRect = this.$root.getBoundingClientRect()
//     const { top, bottom } = rootDomRect
//     const boxHeight = bottom - top
//     const viewportHeight = document.documentElement.clientHeight
//     const propsAnchor = this.props.anchor ?? 0
//     let anchorPos: number
//     if (propsAnchor === 'top') anchorPos = 0
//     else if (propsAnchor === 'center' || propsAnchor === 'middle') anchorPos = 0.5 * viewportHeight
//     else if (propsAnchor === 'bottom') anchorPos = viewportHeight
//     else if (typeof propsAnchor === 'string') anchorPos = 0
//     else anchorPos = propsAnchor * viewportHeight
//     const minTop = 0 + anchorPos
//     const maxTop = -1 * (boxHeight - anchorPos)
//     const scrollPercent = (top - minTop) / (maxTop - minTop)
//     this.setState({ scrollPercent })
//   }

//   /* * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * */
//   render (): JSX.Element {
//     const { props, state } = this
//     const classes: string = clss(this.mainClass, props.className)
//     const inlineStyle = { ...props.style }
//     const { scrollPercent } = state
//     const renderer = this.props.render !== undefined
//       ? this.props.render
//       : () => <></>
//     return (
//       <div
//         className={classes}
//         style={inlineStyle}
//         ref={n => { this.$root = n }}>
//         {renderer(scrollPercent)}
//       </div>
//     )
//   }
// }

// export type { Props, State }
// export default Parallax
