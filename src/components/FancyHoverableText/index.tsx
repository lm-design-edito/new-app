console.error('FancyHoverableText component use is deprecated')

export default (props: any) => <div>
  FancyHoverableText component.
</div>

// import { Component, JSX } from 'preact'
// import clss from 'classnames'
// import './styles.css'

// interface Props {
//   className?: string
//   style?: JSX.CSSProperties
//   text?: string
//   animationSpeed?: string
//   fillEndColor?: string
//   fillSlant?: string
//   fillStartColor?: string
//   shadowColor?: string
//   shadowDefinition?: number
//   shadowSize?: string
//   hover?: boolean
// }

// interface State {
//   hover: boolean
// }

// class FancyHoverableText extends Component<Props, State> {
//   mainClass: string = 'lm-fancy-hoverable-text'
//   state = {
//     hover: false
//   }

//   /* * * * * * * * * * * * * * *
//    * CONSTRUCTOR
//    * * * * * * * * * * * * * * */
//   constructor (props: Props) {
//     super(props)
//     this.handleHover = this.handleHover.bind(this)
//     this.handleLeave = this.handleLeave.bind(this)
//   }

//   /* * * * * * * * * * * * * * *
//    * HANDLE HOVER & LEAVE
//    * * * * * * * * * * * * * * */
//   handleHover (e: MouseEvent): void { this.setState({ hover: true }) }
//   handleLeave (e: MouseEvent): void { this.setState({ hover: false }) }

//   /* * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * */
//   render (): JSX.Element {
//     const { props, state } = this
//     const classes: string = clss(this.mainClass, props.className)
//     const inlineStyle = { ...props.style }

//     /* Default props */
//     const animationSpeed = props.animationSpeed ?? '500ms'
//     const fillEndColor = props.fillEndColor ?? 'white'
//     const fillSlant = props.fillSlant ?? '-45deg'
//     const fillStartColor = props.fillStartColor ?? 'black'
//     const shadowColor = props.shadowColor ?? 'black'
//     const shadowDefinition = props.shadowDefinition ?? 16
//     const shadowSize = props.shadowSize ?? '1px'
//     const hover = props.hover ?? state.hover

//     /* Shadow */
//     const textShadow = new Array(shadowDefinition).fill(null).map((e, i) => {
//       const angle = Math.PI * 2 * i / shadowDefinition
//       const cos = Math.cos(angle)
//       const sin = Math.sin(angle)
//       const xVal = `calc(${shadowSize} * ${cos})`
//       const yVal = `calc(${shadowSize} * ${sin})`
//       const returned = `${xVal} ${yVal} 0 ${shadowColor},`
//       return returned
//     }).join('').slice(0, -1)
//     const shadowStyle = {
//       textShadow: hover ? 'none' : textShadow,
//       transition: `text-shadow ${animationSpeed}`,
//       color: fillStartColor
//     }

//     /* Fill */
//     const fillBgColor = `linear-gradient(${fillSlant}, ${fillStartColor} 50%, ${fillEndColor} 50.01%)`
//     const fillBgPos = hover ? '0% center' : '100% center'
//     const fillBgClip = 'text'
//     const fillBgSize = '300% auto'
//     const fillStyle = {
//       background: fillBgColor,
//       backgroundPosition: fillBgPos,
//       backgroundSize: fillBgSize,
//       backgroundClip: fillBgClip,
//       WebkitBackgroundClip: fillBgClip,
//       transition: `background-position ${animationSpeed}`
//     }

//     return (
//       <div
//         className={classes}
//         style={inlineStyle}
//         onMouseEnter={this.handleHover}
//         onMouseLeave={this.handleLeave}>
//         <span
//           className={`${this.mainClass}__shadow`}
//           style={shadowStyle}>
//           {props.children}
//         </span>
//         <span
//           className={`${this.mainClass}__fill`}
//           style={fillStyle}>
//           {props.children}
//         </span>
//       </div>
//     )
//   }
// }

// export type { Props, State }
// export default FancyHoverableText
