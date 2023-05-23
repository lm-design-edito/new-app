import { Component, VNode } from 'preact'
import Img from '~/components/Img'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

export type Props = {
  imageUrl?: string
  imageAlt?: string
  textTop?: string | VNode
  textCenter?: string | VNode
  textBottom?: string | VNode
  shadeLinearGradient?: string
  shadeBlendMode?: string
}

export default class ImageOverlay extends Component<Props, {}> {
  bemClss = bem('lm-image-overlay')

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render () {
    const { props, bemClss } = this
    const wrapperClasses = [bemClss.value, styles['wrapper']]
    const imageClasses = [bemClss.elt('image').value, styles['image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]
    const textTopClasses = [bemClss.elt('text-top').value, styles['text-top']]
    const textCenterClasses = [bemClss.elt('text-center').value, styles['text-center']]
    const textBottomClasses = [bemClss.elt('text-bottom').value, styles['text-bottom']]
    const {
      imageUrl,
      imageAlt,
      textTop,
      textCenter,
      textBottom,
      shadeLinearGradient,
      shadeBlendMode
    } = props
    const wrapperStyle = {
      ['--shade-gradient']: shadeLinearGradient !== undefined
        ? `linear-gradient(${shadeLinearGradient})`
        : undefined,
      ['--shade-blend-mode']: shadeBlendMode
    }
    return <div
      className={wrapperClasses.join(' ')}
      style={wrapperStyle}>
      {/* image */}
      {imageUrl && <div className={imageClasses.join(' ')}><Img src={imageUrl} alt={imageAlt} /></div>}
      {/* shade */}
      {<div className={shadeClasses.join(' ')} />}
      {/* text */}
      {textTop && <div className={textTopClasses.join(' ')}>{textTop}</div>}
      {textCenter && <div className={textCenterClasses.join(' ')}>{textCenter}</div>}
      {textBottom && <div className={textBottomClasses.join(' ')}>{textBottom}</div>}
    </div>
  }
}
