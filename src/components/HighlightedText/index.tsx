console.error('HighlightedText component use is deprecated')

export default (props: any) => <div>
  HighlightedText component.
</div>

// import { Component, ComponentChildren, JSX } from 'preact'
// import clss from 'classnames'
// import './styles.css'

// interface Props {
//   className?: string
//   style?: JSX.CSSProperties
//   children?: ComponentChildren
//   highlightColor?: string
//   offset?: string
// }

// class HighlightedText extends Component<Props, {}> {
//   mainClass: string = 'lm-highlighted-text'

//   /* * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * */
//   render (): JSX.Element {
//     const { props } = this
//     const classes: string = clss(this.mainClass, props.className)
//     const inlineStyle = {
//       ...props.style,
//       '--c-highlight': props.highlightColor,
//       '--len-highlight-offset': props.offset
//     }

//     return (
//       <span
//         className={classes}
//         style={inlineStyle}>
//         <span className={`${this.mainClass}__inner`}>
//           {props.children}
//         </span>
//       </span>
//     )
//   }
// }

// export type { Props }
// export default HighlightedText
