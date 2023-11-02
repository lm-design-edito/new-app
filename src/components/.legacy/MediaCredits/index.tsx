import { Component, VNode, JSX } from 'preact'
import bem from '~/utils/bem'
// [WIP] css modules
import './styles.scss'

export interface Props {
  className?: string
  style?: JSX.CSSProperties
  content?: VNode|string
}

export default class MediaCredits extends Component<Props, {}> {
  static clss: string = 'lm-media-credits'
  clss = MediaCredits.clss

  render () {
    const { props } = this

    // Assign classes and styles
    const wrapperClasses = bem(props.className).block(this.clss)
    const wrapperStyle: JSX.CSSProperties = {...props.style }

    return <span
      className={wrapperClasses.value}
      style={wrapperStyle}>
      {this.props.content}
    </span>
  }
}
