import { Component, JSX } from 'preact'

import Icon, { Icons } from '~/components/Icon'
import Slide, { Media } from './components/Slide'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface ArrowsProps {
  leftArrow: boolean
  rightArrow: boolean
  index: number
  limit: number
}

interface SlideshowSettings {
  leftArrow?: boolean
  rightArrow?: boolean
  dots?: boolean
  loop?: boolean
  duration?: number
  height?: string
  imageFit?: string
  toggleDescriptionBtn?: boolean
  credits?: string
  description?: string
}

interface Props {
  settings?: SlideshowSettings
  images?: Media[]
}

interface State {
  index: number
  descriptionOpen: boolean
}

class Slideshow extends Component<Props, State> {
  settings: any

  displayDots: boolean
  displayArrows: boolean
  displayControls: boolean

  defaultLoopDuration: number
  loopDuration: number

  loopTimer!: number

  bemClss = bem('lm-slideshow')

  state = {
    index: 0,
    descriptionOpen: false,
  }

  /* * * * * * * * * * * * * * * * * * *
     * CONSTRUCTOR
     * * * * * * * * * * * * * * * * * * */
  constructor(props: Props) {
    super(props)

    this.settings = this.props.settings ?? {}
    if (typeof this.settings === 'string') this.settings = {}

    this.displayDots = this.settings.dots
    this.displayArrows = this.settings.leftArrow || this.settings.rightArrow
    this.displayControls = this.displayDots || this.displayArrows

    if (!this.displayControls) { this.settings.loop = true }

    this.defaultLoopDuration = 2000
    this.loopDuration = Number.isInteger(this.settings.duration) ? this.settings.duration : this.defaultLoopDuration

    this.incrementIndex = this.incrementIndex.bind(this)
    this.decrementIndex = this.decrementIndex.bind(this)

    this.toggleDescription = this.toggleDescription.bind(this)
  }

  /* * * * * * * * * * * * * * * * * * *
     * METHODS
     * * * * * * * * * * * * * * * * * * */
  componentDidMount() {
    if (this.settings.loop) {
      this.setLoopTimer(this.loopDuration)
    }

    if (!this.settings.toggleDescriptionBtn) {
      this.setState(curr => ({
        ...curr,
        descriptionOpen: true
      }))
    }
  }

  componentWillUnmount() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer)
    }
  }

  setLoopTimer(duration: number) {
    this.loopTimer = window.setInterval(() => {
      this.incrementIndex()
    }, duration)
  }

  setIndex(number: number) {
    if (this.loopTimer) {
      clearInterval(this.loopTimer)
      this.setLoopTimer(this.loopDuration)
    }

    this.setState(curr => ({
      ...curr,
      index: number
    }))
  }

  incrementIndex() {
    if (this.props.images === undefined) return

    const nextIndex = this.state.index === this.props.images.length - 1 ? 0 : this.state.index + 1
    this.setIndex(nextIndex)
  }

  decrementIndex() {
    if (this.props.images === undefined) return

    const prevIndex = this.state.index === 0 ? this.props.images.length - 1 : this.state.index - 1
    this.setIndex(prevIndex)
  }

  toggleDescription() {
    this.setState(curr => ({
      ...curr,
      descriptionOpen: !curr.descriptionOpen
    }))
  };

  /* * * * * * * * * * * * * * * * * * *
     * RENDER
     * * * * * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, state, bemClss } = this

    const containerClasses = [bemClss.value, styles['container']]
    if (props.settings?.imageFit === 'cover') containerClasses.push(styles['container--cover'])
    else containerClasses.push(styles['container--contain'])

    const imagesClasses = [bemClss.elt('images').value, styles['images']]
    const controlsClasses = [bemClss.elt('controls').value, styles['controls']]
    const arrowsClasses = [bemClss.elt('arrows').value, styles['arrows']]
    const leftArrowClasses = [bemClss.elt('arrow').value, styles['arrow']]
    const rightArrowClasses = [bemClss.elt('arrow').value, styles['arrow']]
    if (state.index === 0) leftArrowClasses.push(styles['arrow--disabled'])
    if (state.index === (props.images?.length ?? 0) - 1) rightArrowClasses.push(styles['arrow--disabled'])
    const dotsClasses = [bemClss.elt('dots').value, styles['dots']]

    const containerStyle = `--slideshow-max-height: ${this.settings.height ? this.settings.height : 'none'}; `

    return (
      < div className={containerClasses.join(' ')} style={containerStyle}>
        <div className={imagesClasses.join(' ')}>
          {props.images?.map((media, i) => {
            return <Slide
              media={media}
              selected={this.state.index === i}
              settings={this.settings}
              toggleDescription={this.toggleDescription}
              descriptionOpen={this.state.descriptionOpen}
            />
          })}
        </div>

        {this.displayControls
          && <div className={controlsClasses.join(' ')}>

            {this.displayDots && props.images?.length
              && <div className={dotsClasses.join(' ')}>
                {[...Array(props.images.length)].map((_el, i) => {
                  const dotClasses = [bemClss.elt('dot').value, styles['dot']]
                  if (this.state.index === i) dotClasses.push(styles['dot--selected'])

                  return (
                    <span
                      onClick={() => this.setIndex(i)}
                      className={dotClasses.join(' ')}>
                    </span>
                  )
                })}
              </div>}

            {this.displayArrows
              && <div className={arrowsClasses.join(' ')}>

                {props.settings?.leftArrow
                  && <div className={leftArrowClasses.join(' ')} onClick={this.decrementIndex}>
                    <Icon file={Icons.ARROW_LEFT} />
                  </div>}

                {props.settings?.rightArrow
                  && <div className={rightArrowClasses.join(' ')} onClick={this.incrementIndex}>
                    <Icon file={Icons.ARROW_RIGHT} />
                  </div>}

              </div>}

          </div>}
      </div >
    )
  }
}

export type { Props, State, SlideshowSettings, Media }
export default Slideshow
