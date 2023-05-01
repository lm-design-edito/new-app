import { Component, JSX, VNode } from 'preact'
import bem from '~/utils/bem'
import './styles.scss'

interface Props {
  className?: string
  style?: JSX.CSSProperties
  content?: VNode|string
  textAlign?: string
}

class SimpleStylableTextCard extends Component<Props, {}> {
  static clss = 'lm-simple-stylable-text-card'
  clss = SimpleStylableTextCard.clss

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props } = this

    /* Classes and style */
    const wrapperClasses = bem(props.className).block(this.clss)
    const wrapperStyle: JSX.CSSProperties = {
      ...props.style,
      '--text-align': props.textAlign
    }

    /* Display */
    return (
      <div
        style={wrapperStyle}
        className={wrapperClasses.value}>
        {props.content}
      </div>
    )
  }
}

export type { Props }
export default SimpleStylableTextCard
