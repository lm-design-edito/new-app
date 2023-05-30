import { Component, JSX, createRef, RefObject } from 'preact'

import Icon, { Icons } from '~/components/Icon'
import Img from '~/components/Img'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface Media {
  url?: string
  mobileUrl?: string
  type?: string
  imageFit?: string
  description?: string
  credits?: string
}

interface Props {
  media?: Media
  selected?: boolean
  slideshowDescription?: string
  slideshowCredits?: string
  toggleDescriptionBtn?: boolean
  toggleDescription?: () => void
  descriptionOpen?: boolean
}

interface State {
  descriptionHeight: number
}

class Slide extends Component<Props, {}> {
  descriptionRef: RefObject<HTMLDivElement>
  video: RefObject<HTMLVideoElement> | null = null
  lastSelected: boolean

  bemClss = bem('lm-slide')

  state = {
    descriptionHeight: 20
  }

  constructor(props: Props) {
    super(props)

    this.descriptionRef = createRef()
    this.calculateDescriptionHeight = this.calculateDescriptionHeight.bind(this)

    if (props.media?.type === 'video') {
      this.video = createRef()
    }

    this.lastSelected = false
    this.toggleVideo = this.toggleVideo.bind(this)
  }

  componentDidMount() {
    this.calculateDescriptionHeight()
    window.addEventListener('resize', this.calculateDescriptionHeight)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calculateDescriptionHeight)
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

  calculateDescriptionHeight() {
    if (!this.descriptionRef) return

    const descriptionBlock = this.descriptionRef.current

    if (!descriptionBlock) return

    const descriptionHeight = descriptionBlock
      .getBoundingClientRect()
      .height

    this.setState(curr => ({
      ...curr,
      descriptionHeight
    }))
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

    let credits = ''
    if (props.slideshowCredits) credits = props.slideshowCredits
    if (props.media?.credits) credits = props.media?.credits

    let description = ''
    if (props.slideshowDescription) description = props.slideshowDescription
    if (props.media?.description) description = props.media?.description

    if (credits === '' && description === '') { displayCaption = false }

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

    const toggleDescriptionText = props.descriptionOpen ? 'Voir moins' : 'Voir plus'

    const captionTranslate = props.descriptionOpen ? 0 : this.state.descriptionHeight + 4
    const captionStyle = `transform: translateY(${captionTranslate}px);`

    return (
      <div className={containerClasses.join(' ')}>
        <div className={imageClasses.join(' ')}>
          {props.media?.type === 'video'
            ? <video onClick={this.toggleVideo} ref={this.video} muted loop playsInline autoPlay={props.selected} src={mediaURL} />
            : <Img src={mediaURL} loading='eager' />}
        </div>

        {displayCaption
          && <div className={captionClasses.join(' ')} style={captionStyle}>

            {(description && props.toggleDescriptionBtn)
              && <div className={toggleDescriptionBtnClasses.join(' ')} onClick={props.toggleDescription}>
                <p>{toggleDescriptionText}</p>
                {props.descriptionOpen
                  ? <Icon file={Icons.TOGGLE_CLOSE} />
                  : <Icon file={Icons.TOGGLE_OPEN} />}
              </div>}

            {credits
              && <div className={creditsClasses.join(' ')}>
                <p>{credits}</p>
              </div>}

            {description
              && <div className={descriptionClasses.join(' ')} ref={this.descriptionRef}>
                <p>{description}</p>
              </div>}

          </div>}
      </div>
    )

  }
}

export type { Props, State, Media }
export default Slide
