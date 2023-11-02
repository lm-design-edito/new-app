import { Component, JSX, createRef, VNode, RefObject } from 'preact'

import Img from '~/components/Img'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

const isMobile = window.innerWidth < 768

interface Media {
  url?: string
  mobileUrl?: string
  type?: string
  imageFit?: string
  description?: string|VNode
  credits?: string|VNode
}

interface Props {
  selected?: boolean
  visible?: boolean
  media?: Media
  carouselDescription?: string|VNode
  carouselCredits?: string|VNode
  onImageLoad?: () => void
  imageWrapperRef?: RefObject<HTMLDivElement>
}

class CarouselElement extends Component<Props, {}> {
  video: RefObject<HTMLVideoElement> | null = null
  lastSelected: boolean

  bemClss = bem('lm-carousel-element')

  constructor(props: Props) {
    super(props)

    if (props.media?.type === 'video') {
      this.video = createRef()
    }

    this.lastSelected = false
    this.toggleVideo = this.toggleVideo.bind(this)
  }

  toggleVideo() {
    if (!this.props.selected) return
    if (!this.video?.current) return

    if (this.video.current.paused) {
      this.video.current.play()
    } else {
      this.video.current.pause()
    }
  }

  /* * * * * * * * * * * * * * *
    * RENDER
    * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, bemClss } = this

    if (props.media?.type === 'video' && this.video?.current) {
      // on lance automatiquement la vidéo si on arrive dessus
      if (props.selected && !this.lastSelected) {
        this.video?.current.play()
      }
      // et on met en pause si on en part
      if (this.lastSelected && !props.selected) {
        this.video?.current.pause()
      }
    }

    if (props.selected !== undefined) this.lastSelected = props.selected

    let displayCaption = true

    let credits = undefined
    if (props.carouselCredits) credits = props.carouselCredits
    if (props.media?.credits) credits = props.media?.credits

    let description = undefined
    if (props.carouselDescription) description = props.carouselDescription
    if (props.media?.description) description = props.media?.description

    if (credits === undefined && description === undefined) { displayCaption = false }

    const wrapperClasses = [bemClss.elt('wrapper').value, styles['wrapper']]
    if (props.selected) wrapperClasses.push(styles['wrapper--selected'])
    if (props.visible) wrapperClasses.push(styles['wrapper--visible'])
    // wip - à préciser
    if (props.media?.imageFit) wrapperClasses.push(styles[`wrapper--${props.media.imageFit}`])

    const imageClasses = [bemClss.elt('image').value, styles['image']]
    const captionClasses = [bemClss.elt('caption').value, styles['caption']]
    const descriptionClasses = [bemClss.elt('description').value, styles['description']]
    const creditsClasses = [bemClss.elt('credits').value, styles['credits']]

    const imageUrl = isMobile
      ? (props.media?.mobileUrl ?? props.media?.url)
      : props.media?.url

    return (
      <div className={wrapperClasses.join(' ')}>
        <div
          ref={props.imageWrapperRef}
          className={imageClasses.join(' ')}>
          {props.media?.type === 'video'
            ? <video
              muted
              loop
              playsInline
              onClick={this.toggleVideo}
              ref={this.video}
              autoPlay={props.selected}
              src={props.media?.url} />
            : (imageUrl !== undefined
              && <Img
              onLoad={props.onImageLoad}
              src={imageUrl}
              loading='eager' />
            )}
        </div>

        {displayCaption
          ? <div className={captionClasses.join(' ')}>
            
            {description
              && <div className={descriptionClasses.join(' ')}>
                <p>{description}</p>
              </div>}

            {credits
              && <div className={creditsClasses.join(' ')}>
                <p>{credits}</p>
              </div>}
          </div>
          : <div></div>}
      </div>

    )
  }

}

export type { Props, Media }
export default CarouselElement