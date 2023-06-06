import { Component, JSX, VNode } from 'preact'

import ToggleButton from '~/components/ToggleButton'
import Drawer from '~/components/Drawer'
import Img from '~/components/Img'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

type State = {
  captionIsOpen: boolean
}

export type Props = {
  imageUrl?: string
  imageSrcset?: string
  imageSizes?: string
  imageAlt?: string
  loading?: JSX.HTMLAttributes<HTMLImageElement>['loading']
  textTop?: string | VNode
  textMiddle?: string | VNode
  textBottom?: string | VNode
  shadeLinearGradient?: string
  shadeBlendMode?: string
  toggleCaptionBtn?: boolean
  captionDefaultStatus?: 'open'|'closed'
  openCaptionText?: string
  closeCaptionText?: string
  openCaptionIcon?: VNode
  closeCaptionIcon?: VNode
}

export default class ImageOverlay extends Component<Props, State> {
  bemClss = bem('lm-image-overlay')

  state = {
    captionIsOpen: this.props.captionDefaultStatus === 'open' ? true : false,
  }

  /* * * * * * * * * * * * * * * * * * *
     * CONSTRUCTOR
     * * * * * * * * * * * * * * * * * * */
  constructor(props: Props) {
    super(props)

    this.toggleCaption = this.toggleCaption.bind(this)
  }

  toggleCaption() {
    this.setState(curr => ({
      ...curr,
      captionIsOpen: !curr.captionIsOpen
    }))
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render() {
    const { props, state, bemClss } = this

    const {
      imageUrl,
      imageSrcset,
      imageSizes,
      imageAlt,
      loading,
      textTop,
      textMiddle,
      textBottom,
      shadeLinearGradient,
      shadeBlendMode,
      toggleCaptionBtn,
      closeCaptionText,
      openCaptionText,
      closeCaptionIcon,
      openCaptionIcon
    } = props

    const wrapperClasses = [bemClss.mod({
      'caption-open': toggleCaptionBtn === true && state.captionIsOpen === true,
      'caption-closed': toggleCaptionBtn === true && state.captionIsOpen === false
    }).value, styles['wrapper']]
    const imageClasses = [bemClss.elt('image').value, styles['image']]
    const shadeClasses = [bemClss.elt('shade').value, styles['shade']]
    const textTopClasses = [bemClss.elt('text-top').value, styles['text-top']]
    const textMiddleClasses = [bemClss.elt('text-middle').value, styles['text-middle']]
    const textBottomClasses = [bemClss.elt('text-bottom').value, styles['text-bottom']]

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
      {imageUrl && <div className={imageClasses.join(' ')}>
        <Img
          src={imageUrl}
          srcset={imageSrcset}
          sizes={imageSizes}
          alt={imageAlt}
          loading={loading} />
      </div>}
      {/* shade */}
      {<div className={shadeClasses.join(' ')} />}
      {/* text */}
      {[
        { content: textTop, classes: textTopClasses },
        { content: textMiddle, classes: textMiddleClasses },
        { content: textBottom, classes: textBottomClasses }
      ].map((text) => {
        if (text.content === undefined) return
        if (toggleCaptionBtn !== true) return <div className={text.classes.join(' ')}>{text.content}</div>
        else return (
          <div className={text.classes.join(' ')}>
            <ToggleButton
              isOpen={state.captionIsOpen}
              openText={openCaptionText}
              closeText={closeCaptionText}
              openIcon={openCaptionIcon}
              closeIcon={closeCaptionIcon}
              onClick={this.toggleCaption}
            />
            <Drawer opened={state.captionIsOpen}>
              {text.content}
            </Drawer>
          </div>
        )
      })}
    </div>
  }
}
