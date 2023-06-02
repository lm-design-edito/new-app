import { Component, FunctionComponent, JSX, VNode } from 'preact'
import { JSXInternal } from 'preact/src/jsx'
import ImageOverlay from '~/components/ImageOverlay'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  imageUrl?: string
  imageAlt?: string
  loading?: JSX.HTMLAttributes<HTMLImageElement>['loading']
  textAbove?: string|VNode
  textBelow?: string|VNode
  textLeftTop?: string|VNode
  textLeftMiddle?: string|VNode
  textLeftBottom?: string|VNode
  textRightTop?: string|VNode
  textRightMiddle?: string|VNode
  textRightBottom?: string|VNode
  textCenterTop?: string|VNode
  textCenterMiddle?: string|VNode
  textCenterBottom?: string|VNode
  shadeLinearGradient?: string
  shadeBlendMode?: string
  toggleCaptionBtn?: boolean
  captionDefaultStatus?: 'open'|'closed'
  openCaptionText?: string
  closeCaptionText?: string
  openCaptionIcon?: VNode
  closeCaptionIcon?: VNode
  status?: string
  statusOverrides?: { [statusName: string]: Omit<Props, 'status'|'statusOverrides'> }
  href?: string
  onClick?: (event?: JSXInternal.TargetedMouseEvent<HTMLDivElement>) => void|Promise<void>
}

export default class Thumbnail extends Component<Props, {}> {
  bemClss = bem('lm-thumbnail')

  constructor (props: Props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event: JSXInternal.TargetedMouseEvent<HTMLDivElement>) {
    const { onClick } = this.props
    if (onClick !== undefined) onClick(event)
  }

  render () {
    const { props, bemClss } = this
    const { status, statusOverrides } = props
    const hasStatus = status !== undefined
    const hasStatusOverrides = statusOverrides !== undefined
    const hasStatusOverride = hasStatus && hasStatusOverrides && statusOverrides[status] !== undefined
    const fullProps = hasStatusOverride ? { ...props, ...statusOverrides[status] } : { ...props }
    const {
      customClass,
      imageUrl,
      imageAlt,
      loading,
      textAbove,
      textBelow,
      textLeftTop,
      textLeftMiddle,
      textLeftBottom,
      textRightTop,
      textRightMiddle,
      textRightBottom,
      textCenterTop,
      textCenterMiddle,
      textCenterBottom,
      shadeLinearGradient,
      shadeBlendMode,
      toggleCaptionBtn,
      captionDefaultStatus,
      openCaptionText,
      closeCaptionText,
      openCaptionIcon,
      closeCaptionIcon,
      href,
      onClick
    } = fullProps

    // Assign classes and styles
    const wrapperClasses = [customClass, bemClss.value, styles['wrapper']]
    const aboveClasses = [bemClss.elt('above').value, styles['above']]
    const leftClasses = [bemClss.elt('left').value, styles['left']]
    const rightClasses = [bemClss.elt('right').value, styles['right']]
    const belowClasses = [bemClss.elt('below').value, styles['below']]
    const topClasses = [bemClss.elt('top').value, styles['top']]
    const middleClasses = [bemClss.elt('middle').value, styles['middle']]
    const bottomClasses = [bemClss.elt('bottom').value, styles['bottom']]
    const imgWrapperClasses = [bemClss.elt('image-wrapper').value, styles['image-wrapper']]
    const imgClasses = [bemClss.elt('image').value, styles['image']]
    const displayCursorPointer = href ?? onClick !== undefined

    const displayLeft = (textLeftTop ?? textLeftMiddle ?? textLeftBottom) !== undefined
    const displayRight = (textRightTop ?? textRightMiddle ?? textRightBottom) !== undefined
    const wrapperStyle = {
      displayCursorPointer: displayCursorPointer
        ? 'cursor: pointer;'
        : undefined
    }

    const WrapperTag: FunctionComponent = pps => {
      return href === undefined
        ? <div
          className={wrapperClasses.join(' ')}
          style={wrapperStyle}
          onClick={this.handleClick}>
          {pps.children}
        </div>
        : <a
          className={wrapperClasses.join(' ')}
          style={wrapperStyle}
          href={href}>
          {pps.children}
        </a>
    }

    return <WrapperTag>
      {/* Above */}
      {textAbove && <div className={aboveClasses.join(' ')}>{textAbove}</div>}
      {/* Left */}
      {displayLeft && <div className={leftClasses.join(' ')}>
        {textLeftTop && <div className={topClasses.join(' ')}>{textLeftTop}</div>}
        {textLeftMiddle && <div className={middleClasses.join(' ')}>{textLeftMiddle}</div>}
        {textLeftBottom && <div className={bottomClasses.join(' ')}>{textLeftBottom}</div>}
      </div>}
      {/* Image wrapper */}
      <div className={imgWrapperClasses.join(' ')}>
        {/* Image */}
        {imageUrl && <div className={imgClasses.join(' ')}>
          <ImageOverlay
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            loading={loading}
            textTop={textCenterTop}
            textMiddle={textCenterMiddle}
            textBottom={textCenterBottom}
            shadeLinearGradient={shadeLinearGradient}
            shadeBlendMode={shadeBlendMode}
            toggleCaptionBtn={toggleCaptionBtn}
            captionDefaultStatus={captionDefaultStatus}
            openCaptionText={openCaptionText}
            closeCaptionText={closeCaptionText}
            openCaptionIcon={openCaptionIcon}
            closeCaptionIcon={closeCaptionIcon} />
        </div>}
      </div>
      {/* Right */}
      {displayRight && <div className={rightClasses.join(' ')}>
        {textRightTop && <div className={topClasses.join(' ')}>{textRightTop}</div>}
        {textRightMiddle && <div className={middleClasses.join(' ')}>{textRightMiddle}</div>}
        {textRightBottom && <div className={bottomClasses.join(' ')}>{textRightBottom}</div>}
      </div>}
      {/* Below */}
      {textBelow && <div className={belowClasses.join(' ')}>{textBelow}</div>}
    </WrapperTag>
  }
}
