import { Component, JSX, createRef, RefObject, VNode } from 'preact'

import Icon, { Icons } from '~/components/Icon'
import ToggleButton from '~/components/_ToggleButton'
import Drawer from '~/components/Drawer'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface Media {
  url?: string
  mobileUrl?: string
  type?: string
  imageFit?: string
  description?: string|VNode
  credits?: string|VNode
}

interface Props {
  media?: Media
  selected?: boolean
  slideshowDescription?: string|VNode
  slideshowCredits?: string|VNode
  toggleDescriptionBtn?: boolean
  toggleDescription?: () => void
  descriptionOpen?: boolean
}

class Slide extends Component<Props, {}> {
  video: RefObject<HTMLVideoElement> | null = null
  lastSelected: boolean

  bemClss = bem('lm-slide')


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
    if (props.slideshowCredits) credits = props.slideshowCredits
    if (props.media?.credits) credits = props.media?.credits

    let description = undefined
    if (props.slideshowDescription) description = props.slideshowDescription
    if (props.media?.description) description = props.media?.description

    if (credits === undefined && description === undefined) { displayCaption = false }

    let mediaURL = props.media?.url
    if (props.media?.mobileUrl && window.innerWidth < 768) {
      mediaURL = props.media.mobileUrl
    }

    const containerClasses = [bemClss.elt('container').value, styles['container']]
    if (props.selected) containerClasses.push(styles['container--selected'])
    if (props.media?.imageFit) containerClasses.push(styles[`container--${props.media.imageFit}`])

    const imageClasses = [bemClss.elt('image').value, styles['image']]
    const captionClasses = [bemClss.elt('caption').value, styles['caption']]
    const toggleDescriptionBtnClasses = [bemClss.elt('toggle-description-btn').value, styles['toggle-description-btn']]
    const creditsClasses = [bemClss.elt('credits').value, styles['credits']]
    const descriptionClasses = [bemClss.elt('description').value, styles['description']]
    if (!props.descriptionOpen) descriptionClasses.push(styles['description--hidden'])

    const creditsContent = <div className={creditsClasses.join(' ')}><p>{credits}</p></div>
    const descriptionContent = <div className={descriptionClasses.join(' ')}><p>{description}</p></div>

    return (
      <div className={containerClasses.join(' ')}>
        <div className={imageClasses.join(' ')}>
          {props.media?.type === 'video'
            ? <video onClick={this.toggleVideo} ref={this.video} muted loop playsInline autoPlay={props.selected} src={mediaURL} />
            : <img src={mediaURL} loading='eager' />}
        </div>

        {displayCaption && <div className={captionClasses.join(' ')}>
          
          {props.toggleDescriptionBtn
            ? <>
              <ToggleButton
                customClass={toggleDescriptionBtnClasses.join(' ')}
                isOpen={props.descriptionOpen}
                openText={'Voir plus'}
                closeText={'Voir moins'}
                openIcon={<Icon file={Icons.TOGGLE_OPEN} />}
                closeIcon={<Icon file={Icons.TOGGLE_CLOSE} />}
                onClick={props.toggleDescription}
              />
              {credits && creditsContent}
              <Drawer defaultState={props.descriptionOpen ? 'opened': 'closed'}>
                {description && descriptionContent}
              </Drawer>
            </>
            : <>
              {credits && creditsContent}
              {description && descriptionContent}
            </>
          }

        </div>}
      </div>
    )

  }
}

export type { Props, Media }
export default Slide
