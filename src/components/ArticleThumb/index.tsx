import { Component, VNode } from 'preact'
import Img from '~/components/Img'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

type Props = {
  customClass?: string
  customCss?: string
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
  imageMaxWidth?: string
  shadeFromPos?: string
  shadeFromColor?: string
  shadeToPos?: string
  shadeToColor?: string
  status?: string
  href?: string
  onClick?: any
  statusOverrides?: { [statusName: string]: Omit<Props, 'status'|'statusOverrides'> }
}

class ArticleThumbV2 extends Component<Props, {}> {
  bemClss = bem('lm-article-thumbnail')

  constructor(props: Props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  async handleClick() {
    if (this.props.onClick) await this.props.onClick()
    if (this.props.href) window.location.assign(this.props.href)
  }

  render() {
    const { props, bemClss } = this
    const { status, statusOverrides } = props
    const hasStatus = status !== undefined
    const hasStatusOverrides = statusOverrides !== undefined
    const hasStatusOverride = hasStatus && hasStatusOverrides && statusOverrides[status] !== undefined
    const fullProps = hasStatusOverride
      ? { ...props, ...statusOverrides[status] }
      : { ...props }

    // Assign classes and styles
    const wrapperClasses = [fullProps.customClass, bemClss.value, styles['wrapper']]
    const aboveClasses = [bemClss.elt('above').value, styles['above']]
    const belowClasses = [bemClss.elt('below').value, styles['below']]
    const beforeClasses = [bemClss.elt('before').value, styles['before']]
    const afterClasses = [bemClss.elt('after').value, styles['after']]
    const topClasses = [bemClss.elt('top').value, styles['top']]
    const centerClasses = [bemClss.elt('center').value, styles['center']]
    const bottomClasses = [bemClss.elt('bottom').value, styles['bottom']]
    const imgWrapperClasses = [bemClss.elt('image-wrapper').value, styles['image-wrapper']]
    const imgClasses = [bemClss.elt('image').value, styles['image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]

    const displayCursorPointer = fullProps.href || fullProps.onClick

    const wrapperStyle = `
      --footer-img-max-width: ${fullProps.imageMaxWidth ?? 'unset'};
      ${displayCursorPointer ? 'cursor: pointer;' : ''}
    `

    // [WIP] variables on wrapper here
    const shadeStyle = `background: linear-gradient(
      ${fullProps.shadeFromColor ?? 'transparent'} 
      ${fullProps.shadeFromPos ?? '50%'}, 
      ${fullProps.shadeToColor ?? 'rgba(0, 0, 0, 0.3)'} 
      ${fullProps.shadeToPos ?? '100%'});`

    const displayBefore = (fullProps.textBeforeTop
      ?? fullProps.textBeforeCenter
      ?? fullProps.textBeforeBottom) !== undefined
    const displayAfter = (fullProps.textAfterTop
      ?? fullProps.textAfterCenter
      ?? fullProps.textAfterBottom) !== undefined
    const displayShade = (fullProps.shadeFromColor
      ?? fullProps.shadeFromPos
      ?? fullProps.shadeToColor
      ?? fullProps.shadeToPos) !== undefined

    {/* [WIP][ELSA] idéalement si le wrapper est contraint en largeur
      * (via le css du footer par ex), l'image et la shade ne dépassent pas */}

    return <div
      className={wrapperClasses.join(' ')}
      style={wrapperStyle}
      onClick={this.handleClick}
    >

      {/* Styles */}
      {fullProps.customCss && <style>
        {fullProps.customCss}
      </style>}

      {/* [WIP][ELSA] above, before, after, below, image and shade dimensions via props
        * maybe via beforeWidth, imageWidth, afterWidth ? maybe also beforeMaxWidth, imageMaxWidth, afterMaxWidth ?*/}
      {/* [WIP][ELSA] pas sûr que ce soit une bonne idée de contraindre en hauteur above, below et l'image. Pour l'image je pense
        * qu'il faut que ce soit son ratio à elle qui détermine, mais ça se discute. Une prop imageRatio?
        * Pourquoi pas, mais du coup imageFit, et imagePosition aussi, si l'image est pas aux dimensions du conteneur ? */}
      {/* Above */}
      {fullProps.textAbove && <div
        className={aboveClasses.join(' ')}>
        {fullProps.textAbove}
      </div>}

      {/* Before */}
      {displayBefore && <div className={beforeClasses.join(' ')}>
        {fullProps.textBeforeTop && <div
          className={topClasses.join(' ')}>
          {fullProps.textBeforeTop}
        </div>}
        {fullProps.textBeforeCenter && <div
          className={centerClasses.join(' ')}>
          {fullProps.textBeforeCenter}
        </div>}
        {fullProps.textBeforeBottom && <div
          className={bottomClasses.join(' ')}>
          {fullProps.textBeforeBottom}
        </div>}
      </div>}

      {/* Image wrapper */}
      <div className={imgWrapperClasses.join(' ')}>
        {/* Image */}
        {fullProps.imageUrl && <div
          className={imgClasses.join(' ')}>
          <Img src={fullProps.imageUrl} alt={fullProps.imageAlt} />
        </div>}

        {/* Shade */}
        {displayShade && <div
          className={shadeClasses.join(' ')}
          style={shadeStyle} />}

        {/* Inside */}
        {fullProps.textInsideTop && <div
          className={topClasses.join(' ')}>
          {fullProps.textInsideTop}
        </div>}
        {fullProps.textInsideCenter && <div
          className={centerClasses.join(' ')}>
          {fullProps.textInsideCenter}
        </div>}
        {fullProps.textInsideBottom && <div
          className={bottomClasses.join(' ')}>
          {fullProps.textInsideBottom}
        </div>}
      </div>

      {/* After */}
      {displayAfter && <div className={afterClasses.join(' ')}>
        {fullProps.textAfterTop && <div
          className={topClasses.join(' ')}>
          {fullProps.textAfterTop}
        </div>}
        {fullProps.textAfterCenter && <div
          className={centerClasses.join(' ')}>
          {fullProps.textAfterCenter}
        </div>}
        {fullProps.textAfterBottom && <div
          className={bottomClasses.join(' ')}>
          {fullProps.textAfterBottom}
        </div>}
      </div>}

      {/* Below */}
      {fullProps.textBelow && <div
        className={belowClasses.join(' ')}>
        {fullProps.textBelow}
      </div>}
    </div>
  }
}

export type { Props }
export default ArticleThumbV2
