import { Component, JSX, VNode } from 'preact'
import bem from '~/utils/bem'

import './styles.scss'

interface Props {
  className?: string
  style?: JSX.CSSProperties
  content?: VNode|string
}

class ArticleCredits extends Component<Props, {}> {
  static clss = 'lm-article-credits'
  clss = ArticleCredits.clss

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props } = this

    /* Classes and style */
    const wrapperClasses = bem(props.className).block(this.clss)
    const wrapperStyle: JSX.CSSProperties = { ...props.style }

    /* Display */
    return (
      <div className={wrapperClasses.value} style={wrapperStyle}>
        {props.content}
      </div>
    )
  }
}

export type { Props }
export default ArticleCredits
