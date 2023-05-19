import { Component, FunctionComponent, VNode } from 'preact'
import { JSXInternal } from 'preact/src/jsx'
import ImageOverlay from '~/components/ImageOverlay'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  imageUrl?: string
  imageAlt?: string
  textAbove?: string|VNode
  textBelow?: string|VNode
  textBeforeTop?: string|VNode
  textBeforeCenter?: string|VNode
  textBeforeBottom?: string|VNode
  textAfterTop?: string|VNode
  textAfterCenter?: string|VNode
  textAfterBottom?: string|VNode
  textInsideTop?: string|VNode
  textInsideCenter?: string|VNode
  textInsideBottom?: string|VNode
  shadeLinearGradient?: string
  shadeBlendMode?: string
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
      textAbove,
      textBelow,
      textBeforeTop,
      textBeforeCenter,
      textBeforeBottom,
      textAfterTop,
      textAfterCenter,
      textAfterBottom,
      textInsideTop,
      textInsideCenter,
      textInsideBottom,
      shadeLinearGradient,
      shadeBlendMode,
      href,
      onClick
    } = fullProps

    // Assign classes and styles
    const wrapperClasses = [customClass, bemClss.value, styles['wrapper']]
    const aboveClasses = [bemClss.elt('above').value, styles['above']]
    const beforeClasses = [bemClss.elt('before').value, styles['before']]
    const afterClasses = [bemClss.elt('after').value, styles['after']]
    const belowClasses = [bemClss.elt('below').value, styles['below']]
    const topClasses = [bemClss.elt('top').value, styles['top']]
    const centerClasses = [bemClss.elt('center').value, styles['center']]
    const bottomClasses = [bemClss.elt('bottom').value, styles['bottom']]
    const imgWrapperClasses = [bemClss.elt('image-wrapper').value, styles['image-wrapper']]
    const imgClasses = [bemClss.elt('image').value, styles['image']]
    const displayCursorPointer = href ?? onClick !== undefined

    const displayBefore = (textBeforeTop ?? textBeforeCenter ?? textBeforeBottom) !== undefined
    const displayAfter = (textAfterTop ?? textAfterCenter ?? textAfterBottom) !== undefined
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
      {/* Before */}
      {displayBefore && <div className={beforeClasses.join(' ')}>
        {textBeforeTop && <div className={topClasses.join(' ')}>{textBeforeTop}</div>}
        {textBeforeCenter && <div className={centerClasses.join(' ')}>{textBeforeCenter}</div>}
        {textBeforeBottom && <div className={bottomClasses.join(' ')}>{textBeforeBottom}</div>}
      </div>}
      {/* Image wrapper */}
      <div className={imgWrapperClasses.join(' ')}>
        {/* Image */}
        {imageUrl && <div className={imgClasses.join(' ')}>
          <ImageOverlay
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            textTop={textInsideTop}
            textCenter={textInsideCenter}
            textBottom={textInsideBottom}
            shadeLinearGradient={shadeLinearGradient}
            shadeBlendMode={shadeBlendMode} />
        </div>}
      </div>
      {/* After */}
      {displayAfter && <div className={afterClasses.join(' ')}>
        {textAfterTop && <div className={topClasses.join(' ')}>{textAfterTop}</div>}
        {textAfterCenter && <div className={centerClasses.join(' ')}>{textAfterCenter}</div>}
        {textAfterBottom && <div className={bottomClasses.join(' ')}>{textAfterBottom}</div>}
      </div>}
      {/* Below */}
      {textBelow && <div className={belowClasses.join(' ')}>{textBelow}</div>}
    </WrapperTag>
  }
}
