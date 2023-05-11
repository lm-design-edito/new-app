import { Component, JSX, VNode } from 'preact'

import Img from '~/components/Img'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface State { }

interface Props {
  imageUrl?: string
  imageAlt?: string
  textTop?: string | VNode
  textCenter?: string | VNode
  textBottom?: string | VNode
  shadeFromPos?: string
  shadeFromColor?: string
  shadeToPos?: string
  shadeToColor?: string
}

class ImageWithTextOverlay extends Component<Props, State> {
  bemClss = bem('lm-image-overlay')

  /* * * * * * * * * * * * * * * * * * *
   * CONSTRUCTOR
   * * * * * * * * * * * * * * * * * * */
  constructor(props: Props) {
    super(props)
  }

  /* * * * * * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * * * * * */
  componentDidMount() {
    console.log(this.props)
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, bemClss } = this

    const wrapperClasses = [bemClss.value, styles['wrapper']]
    const imageClasses = [bemClss.elt('image').value, styles['image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]
    const textTopClasses = [bemClss.elt('text-top').value, styles['text-top']]
    const textCenterClasses = [bemClss.elt('text-center').value, styles['text-center']]
    const textBottomClasses = [bemClss.elt('text-bottom').value, styles['text-bottom']]

    let shadeGradient = `linear-gradient(
      ${props.shadeFromColor ?? 'transparent'} 
      ${props.shadeFromPos ?? ''},
      ${props.shadeToColor ?? ', transparent'} 
      ${props.shadeToPos ?? ''}
      )
    `

    const displayShade = (props.shadeFromColor
      ?? props.shadeFromPos
      ?? props.shadeToColor
      ?? props.shadeToPos) !== undefined

    const wrapperStyle = `${displayShade ? `--shade-gradient: ${shadeGradient}` : ''}`

    return (
      <div className={wrapperClasses.join(' ')} style={wrapperStyle}>
        {/* image */}
        {props.imageUrl &&
          <div className={imageClasses.join(' ')}>
            <Img src={props.imageUrl} alt={props.imageAlt} />
          </div>}

        {/* shade */}
        {displayShade && <div className={shadeClasses.join(' ')} />}

        {/* text */}
        {props.textTop &&
          <div className={textTopClasses.join(' ')}>
            {props.textTop}
          </div>}

        {props.textCenter &&
          <div className={textCenterClasses.join(' ')}>
            {props.textCenter}
          </div>}

        {props.textBottom &&
          <div className={textBottomClasses.join(' ')}>
            {props.textBottom}
          </div>}
      </div>
    )
  }
}

export type { Props, State }
export default ImageWithTextOverlay
