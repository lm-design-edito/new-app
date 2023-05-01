import { Component, VNode } from 'preact'
import ArticleThumb, { Props as ArticleThumbProps } from '~/components/ArticleThumb'
import IntersectionObserverComponent, { Props as IOCompProps } from '~/components/IntersectionObserver'
import Img from '~/components/Img'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface Props {
  customClass?: string
  customCss?: string
  bgColor?: string
  bgImageUrl?: string
  shadeFromPos?: string
  shadeFromColor?: string
  shadeToPos?: string
  shadeToColor?: string
  textAbove?: string|VNode
  textBelow?: string|VNode
  articleThumbsData?: ArticleThumbProps[]
  thumbnailMaxWidth?: string
  onVisible?: (ioEntry: IntersectionObserverEntry) => void
  onHidden?: (ioEntry: IntersectionObserverEntry) => void
  visibilityThreshold?: number
}

class Footer extends Component<Props, {}> {
  constructor(props: Props) {
    super(props)
    this.handleIntersection = this.handleIntersection.bind(this)
  }

  bemClss = bem('lm-article-footer')

  handleIntersection(...args: Parameters<NonNullable<IOCompProps['callback']>>) {
    const { onVisible, onHidden } = this.props
    const [ioEntry] = args
    const isVisible = ioEntry.isIntersecting
    if (isVisible && onVisible !== undefined) return onVisible(ioEntry)
    if (!isVisible && onHidden !== undefined) return onHidden(ioEntry)
  }

  render() {
    const { props, bemClss, handleIntersection } = this

    // Assign classes and styles
    const wrapperClasses = [props.customClass, bemClss.value, styles['wrapper']]
    const backgroundImageClasses = [bemClss.elt('background-image').value, styles['background-image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]
    const thumbnailsClasses = [bemClss.elt('thumbnails').value, styles['thumbnails']]
    const aboveClasses = [bemClss.elt('above').value, styles['above']]
    const belowClasses = [bemClss.elt('below').value, styles['below']]

    const wrapperStyle = `
      --footer-bg-color: ${props.bgColor ?? 'transparent'};
    `

    const displayShade = (props.shadeFromColor
      ?? props.shadeFromPos
      ?? props.shadeToColor
      ?? props.shadeToPos) !== undefined
    // [WIP] variable here
    const shadeStyle = `
      background: linear-gradient(
        ${props.shadeFromColor ?? 'transparent'} 
        ${props.shadeFromPos ?? '50%'}, 
        ${props.shadeToColor ?? 'transparent'} 
        ${props.shadeToPos ?? '100%'});`

    const thumbsData = props.articleThumbsData ?? []

    return <IntersectionObserverComponent
      threshold={props.visibilityThreshold ?? 0}
      callback={handleIntersection}>
      <div
        className={wrapperClasses.join(' ')}
        style={wrapperStyle}>

        {/* Styles */}
        {props.customCss !== undefined && <style>
          {props.customCss}
        </style>}

        {/* Bg image */}
        {props.bgImageUrl !== undefined && <div
          className={backgroundImageClasses.join(' ')}>
          <Img src={props.bgImageUrl} />
        </div>}

        {/* Shade */}
        {displayShade && <div
          className={shadeClasses.join(' ')}
          style={shadeStyle} />}

        {/* Above */}
        {props.textAbove !== undefined && <div
          className={aboveClasses.join(' ')}>
          {props.textAbove}
        </div>}

        {/* Thumbs */}
        {thumbsData.length !== 0
          && <div className={thumbnailsClasses.join(' ')}>
            {thumbsData?.map((articleThumbProps, i) => (
              <ArticleThumb
                key={i}
                imageMaxWidth={props.thumbnailMaxWidth}
                {...articleThumbProps}
              />
            ))}
          </div>}

        {/* Below */}
        {props.textBelow !== undefined && <div
          className={belowClasses.join(' ')}>
          {props.textBelow}
        </div>}
      </div>
    </IntersectionObserverComponent>
  }
}

export type { Props }
export default Footer
