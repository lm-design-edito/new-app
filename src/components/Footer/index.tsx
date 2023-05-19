import { Component, VNode } from 'preact'
import Thumbnail, { Props as ThumbnailProps } from '~/components/Thumbnail'
import IntersectionObserverComponent, { Props as IOCompProps } from '~/components/IntersectionObserver'
import Img from '~/components/Img'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface Props {
  customClass?: string
  bgColor?: string
  bgImageUrl?: string
  shadeLinearGradient?: string
  textAbove?: string|VNode
  textBelow?: string|VNode
  thumbnailsData?: ThumbnailProps[]
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

    const {
      customClass,
      bgColor = 'transparent',
      bgImageUrl,
      shadeLinearGradient,
      textAbove,
      textBelow,
      thumbnailsData = [],
      visibilityThreshold
    } = props

    // Assign classes and styles
    const wrapperClasses = [customClass, bemClss.value, styles['wrapper']]
    const backgroundImageClasses = [bemClss.elt('background-image').value, styles['background-image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]
    const thumbnailsClasses = [bemClss.elt('thumbnails').value, styles['thumbnails']]
    const aboveClasses = [bemClss.elt('above').value, styles['above']]
    const belowClasses = [bemClss.elt('below').value, styles['below']]
    const displayShade = shadeLinearGradient !== undefined

    const wrapperStyle = { ['--bg-color']: bgColor }
    const shadeStyle = `background: linear-gradient(${shadeLinearGradient});`

    return <IntersectionObserverComponent
      threshold={visibilityThreshold}
      callback={handleIntersection}>
      <div
        className={wrapperClasses.join(' ')}
        style={wrapperStyle}>
        {/* Bg image */}
        {bgImageUrl !== undefined && <div className={backgroundImageClasses.join(' ')}>
          <Img src={bgImageUrl} />
        </div>}
        {/* Shade */}
        {displayShade && <div
          className={shadeClasses.join(' ')}
          style={shadeStyle} />}
        {/* Above */}
        {textAbove !== undefined && <div className={aboveClasses.join(' ')}>{textAbove}</div>}
        {/* Thumbs */}
        {thumbnailsData.length !== 0
          && <div className={thumbnailsClasses.join(' ')}>
            {thumbnailsData?.map((thumbProps, i) => <Thumbnail
              key={i}
              {...thumbProps} />)}
          </div>}
        {/* Below */}
        {textBelow !== undefined && <div className={belowClasses.join(' ')}>{textBelow}</div>}
      </div>
    </IntersectionObserverComponent>
  }
}

export type { Props }
export default Footer
