import { Component, JSX, createRef, RefObject } from 'preact'

import SvgIcon from '../SvgIcon'
import CarouselElement, { Media } from './components/CarouselElement'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

interface State {
  index: number,
  visibleIndex: number,
  arrowsPos: number,
  componentWidth: number,
  carouselWidth: number,
  translateValue: number,
  controlsReady: boolean,
  fullscreen: boolean
}

interface ArrowsProps {
  leftArrow: boolean
  rightArrow: boolean
  index: number
  limit: number
  top: number
}

interface CarouselSettings {
  leftArrow?: boolean
  rightArrow?: boolean
  arrowsPosition?: 'center' | 'bottom'
  dots?: boolean
  loop?: boolean
  duration?: number
  fullscreen?: boolean
  imageHeight?: number
  imageFit?: 'cover' | 'contain'
  gapValue?: number
  backgroundColor?: string
  imageBackgroundColor?: string
  titleColor?: string
  descriptionColor?: string
  creditsColor?: string
  dotColor?: string
  fullscreenButtonColor?: string
  arrowColor?: string
  arrowColorDisabled?: string
  arrowBackgroundColor?: string
  arrowBackgroundColorHover?: string
  title?: string
  credits?: string
  description?: string
}

interface Props {
  settings?: CarouselSettings
  images?: Media[]
}

class Carousel extends Component<Props, State> {
  settings: CarouselSettings

  displayDots: boolean
  displayArrows: boolean
  displayControls: boolean

  defaultLoopDuration: number
  loopDuration: number

  scrollableRef: RefObject<HTMLDivElement>
  componentRef: RefObject<HTMLDivElement>
  imageWrapperRef: RefObject<HTMLDivElement>
  controlsRef: RefObject<HTMLDivElement>
  titleRef: RefObject<HTMLDivElement>

  targetIndex!: number | null
  scrollBreakpoints: number[]
  indexThreshold: number

  gapValue: number
  paddingValue: number

  loopTimer!: number
  loadingInterval!: number

  bemClss = bem('lm-carousel')

  /* * * * * * * * * * * * * * * * * * *
    * CONSTRUCTOR
    * * * * * * * * * * * * * * * * * * */
  constructor(props: Props) {
    super(props)

    this.settings = this.props.settings ?? {}
    if (typeof this.settings === 'string') this.settings = {}

    this.displayDots = this.settings.dots ?? false
    this.displayArrows = (this.settings.leftArrow || this.settings.rightArrow) ?? false
    this.displayControls = this.displayDots || this.displayArrows

    if (!this.displayControls) { this.settings.loop = true }

    this.defaultLoopDuration = 2000
    this.loopDuration = typeof this.settings.duration === 'number'
      ? this.settings.duration
      : this.defaultLoopDuration

    this.scrollableRef = createRef()
    this.componentRef = createRef()
    this.imageWrapperRef = createRef()
    this.controlsRef = createRef()
    this.titleRef = createRef()
    this.targetIndex = null

    this.scrollBreakpoints = []
    this.indexThreshold = 0

    this.gapValue = this.settings.gapValue ?? 16
    this.paddingValue = this.gapValue * 2.5

    this.toggleFullscreen = this.toggleFullscreen.bind(this)

    this.handleScroll = this.handleScroll.bind(this)
    this.calculateDimensions = this.calculateDimensions.bind(this)
    this.fixArrowsPosition = this.fixArrowsPosition.bind(this)
    this.positionArrows = this.positionArrows.bind(this)

    this.incrementIndex = this.incrementIndex.bind(this)
    this.decrementIndex = this.decrementIndex.bind(this)
  }

  /* * * * * * * * * * * * * * * * * * *
    * METHODS
    * * * * * * * * * * * * * * * * * * */
  componentDidMount() {
    if (this.settings.loop) {
      this.setLoopTimer(this.loopDuration)
    }

    this.calculateDimensions()

    setTimeout(this.fixArrowsPosition, 200)
    setTimeout(this.fixArrowsPosition, 500)

    this.loadingInterval = window.setInterval(this.fixArrowsPosition, 1000)

    window.addEventListener('resize', this.calculateDimensions)
  }

  componentWillUnmount() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer)
    }
  }

  handleScroll() {
    // si on s'arrête sur un breakpoint au scroll, on re-update l'index au cas où
    const scrollValue = this.scrollableRef.current?.scrollLeft ?? 0

    let newVisibleIndex = [...this.scrollBreakpoints].filter(breakpoint => breakpoint < (scrollValue - this.indexThreshold)).length

    if (newVisibleIndex != this.state.visibleIndex) {
      this.setState(curr => ({
        ...curr,
        visibleIndex: newVisibleIndex
      }))
    }

    let snappedIndex = this.scrollBreakpoints.findIndex((breakpoint: number) => breakpoint === scrollValue)

    if (snappedIndex != -1) {
      // si on est juste en scroll auto à partir d'un clic sur un point, on s'arrête
      if (this.targetIndex != null && snappedIndex != this.targetIndex) {
        return
      }

      // si on est arrivé sur le bon index, on peut clean targetIndex
      this.targetIndex = null

      this.setState(curr => ({
        ...curr,
        index: snappedIndex,
        translateValue: scrollValue,
      }))
    }
  }

  fixArrowsPosition() {
    if (this.titleRef.current === null) return

    const titleDimensions = this.titleRef.current?.getBoundingClientRect()
    const imageDimensions = this.imageWrapperRef.current?.getBoundingClientRect()

    const titleHeight = titleDimensions ? titleDimensions.height : 0
    const imageHeight = imageDimensions ? imageDimensions.height : 0

    let fixed = this.state.arrowsPos === (titleHeight + imageHeight / 2)
    if (imageHeight === 0) fixed = true

    if (!fixed) {
      this.positionArrows()
    } else {
      this.setState(curr => ({
        ...curr,
        controlsReady: true
      }))

      clearInterval(this.loadingInterval)
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

    this.targetIndex = number

    const translateValue = number === 0
      ? 0
      : number * (this.state.componentWidth - this.gapValue * 4) - this.gapValue * 1.5

    if (this.scrollableRef.current) this.scrollableRef.current.scrollLeft = translateValue

    this.setState(curr => ({
      ...curr,
      index: number,
      translateValue,
    }))
  }

  incrementIndex() {
    if (this.props.images === null || this.props.images === undefined) return

    const nextIndex = this.state.index === this.props.images.length - 1 ? 0 : this.state.index + 1
    this.setIndex(nextIndex)
  }

  decrementIndex() {
    if (this.props.images === null || this.props.images === undefined) return

    const prevIndex = this.state.index === 0 ? this.props.images?.length - 1 : this.state.index - 1
    this.setIndex(prevIndex)
  }

  getContainerClassList(settings: CarouselSettings) {
    const { bemClss } = this

    let classList = [bemClss.value, styles['container']]

    if (settings.imageFit === 'cover') classList.push(styles['container--cover'])
    else classList.push(styles['container--contain'])

    if (settings.arrowsPosition === 'bottom') classList.push(styles['container--arrows-bottom'])
    else classList.push(styles['container--arrows-center'])

    if (this.state.fullscreen) classList.push(styles['container--fullscreen'])

    return classList
  }

  renderArrows({ leftArrow, rightArrow, index, limit, top }: ArrowsProps) {
    const { bemClss } = this

    const leftArrowClasses = [bemClss.elt('arrow').value, styles['arrow']]
    const rightArrowClasses = [bemClss.elt('arrow').value, styles['arrow']]

    if (index === 0) leftArrowClasses.push(styles['arrow--disabled'])
    if (index === limit) rightArrowClasses.push(styles['arrow--disabled'])

    const arrowsClasses = [bemClss.elt('arrows').value, styles['arrows']]
    const arrowsStyle = top ? `top: ${top}px` : ''

    return (
      <div class={arrowsClasses.join(' ')} style={arrowsStyle}>

        {leftArrow
          ? <div class={leftArrowClasses.join(' ')} onClick={this.decrementIndex}>
            <SvgIcon name='arrow-left' />
          </div>
          : ''}

        {rightArrow
          ? <div class={rightArrowClasses.join(' ')} onClick={this.incrementIndex}>
            <SvgIcon name='arrow-right' />
          </div>
          : ''}

      </div>
    )
  }

  renderProgressDots(total: number) {
    const { bemClss } = this

    const dotsClasses = [bemClss.elt('dots').value, styles['dots']]

    return (
      <div class={dotsClasses.join(' ')}>
        {[...Array(total)].map((_el, i) => {
          const dotClasses = [bemClss.elt('dot').value, styles['dot']]
          if (this.state.index === i) dotClasses.push(styles['dot--selected'])

          return (
            <span
              onClick={() => this.setIndex(i)}
              class={dotClasses.join(' ')}>
            </span>
          )
        })}
      </div>
    )
  }

  positionArrows() {
    if (this.titleRef.current === null) return
    if (this.imageWrapperRef.current === null) return

    const titleDimensions = this.titleRef.current?.getBoundingClientRect()
    const imageDimensions = this.imageWrapperRef.current?.getBoundingClientRect()

    const titleHeight = titleDimensions ? titleDimensions.height : 0
    const imageHeight = imageDimensions ? imageDimensions.height : 0
    const imageY = imageDimensions ? imageDimensions.y : 0

    let arrowsPos = 0

    if (imageHeight > 0) {
      arrowsPos = this.state.fullscreen
        ? imageY + imageHeight / 2
        : titleHeight + imageHeight / 2
    }

    this.setState(curr => ({
      ...curr,
      arrowsPos
    }))
  }


  calculateDimensions() {
    const imagesNumber = this.props.images?.length ?? 0

    const componentWidth = this.componentRef.current?.getBoundingClientRect().width ?? 0
    const elementWidth = componentWidth - this.gapValue * 4
    const carouselWidth = imagesNumber * elementWidth - this.gapValue + this.paddingValue * 2

    // on calcule les breakpoints du scroll snap
    if (componentWidth > 0) {
      this.scrollBreakpoints = []
      for (let i = 0; i < imagesNumber; i++) {
        let value = this.paddingValue + i * elementWidth - this.gapValue * 2.5
        if (i === 0) value = 0
        this.scrollBreakpoints.push(value)
      }
    }

    this.indexThreshold = this.scrollBreakpoints[1] / 2

    this.setState(curr => ({
      ...curr,
      componentWidth,
      carouselWidth
    }),
      this.positionArrows
    )
  }

  toggleFullscreen() {
    this.setState(
      curr => ({
        ...curr,
        fullscreen: !curr.fullscreen
      }),
      this.calculateDimensions
    )
  }

  /* * * * * * * * * * * * * * *
    * RENDER
    * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, bemClss } = this

    const titleDimensions = this.titleRef?.current?.getBoundingClientRect()
    const controlsDimensions = this.controlsRef?.current?.getBoundingClientRect()

    const titleHeight = titleDimensions ? titleDimensions.height : 0
    const controlsHeight = controlsDimensions ? controlsDimensions.height : 0

    const imagesMaxHeight = this.state.fullscreen
      ? window.innerHeight - titleHeight - controlsHeight + 'px'
      : 'unset'

    const containerClasses = this.getContainerClassList(this.settings)
    const titleClasses = [bemClss.elt('title').value, styles['title']]
    const fullscreenBtnClasses = [bemClss.elt('fullscreen-btn').value, styles['fullscreen-btn']]
    const scrollableClasses = [bemClss.elt('scrollable').value, styles['scrollable']]
    const imagesClasses = [bemClss.elt('images').value, styles['images']]
    const controlsClasses = [bemClss.elt('controls').value, styles['controls']]
    if (this.state.controlsReady) controlsClasses.push(styles['controls--visible'])

    const containerStyle = `
      --carousel-gap-value: ${this.gapValue}px;
      --carousel-padding-value: ${this.paddingValue}px;
      ${this.settings.backgroundColor ? `--carousel-bg-color: ${this.settings.backgroundColor}` : ''};
      ${this.settings.imageBackgroundColor ? `--carousel-image-bg: ${this.settings.imageBackgroundColor}` : ''};
      ${this.settings.titleColor ? `--carousel-title-color: ${this.settings.titleColor}` : ''};
      ${this.settings.descriptionColor ? `--carousel-description-color: ${this.settings.descriptionColor}` : ''};
      ${this.settings.creditsColor ? `--carousel-credits-color: ${this.settings.creditsColor}` : ''};
      ${this.settings.dotColor ? `--carousel-dot-color: ${this.settings.dotColor}` : ''};
      ${this.settings.fullscreenButtonColor ? `--carousel-fullscreen-btn-color: ${this.settings.fullscreenButtonColor}` : ''};
      ${this.settings.arrowColor ? `--carousel-arrow-color: ${this.settings.arrowColor}` : ''};
      ${this.settings.arrowColorDisabled ? `--carousel-arrow-color-disabled: ${this.settings.arrowColorDisabled}` : ''};
      ${this.settings.arrowBackgroundColor ? `--carousel-arrow-bg: ${this.settings.arrowBackgroundColor}` : ''};
      ${this.settings.arrowBackgroundColorHover ? `--carousel-arrow-bg-hover: ${this.settings.arrowBackgroundColorHover}` : ''};
      ${this.settings.imageHeight && !this.state.fullscreen ? `--carousel-image-height: ${this.settings.imageHeight}px` : ''};
    `

    const imagesContainerStyle = `
      width: ${this.state.carouselWidth}px;
      height: ${imagesMaxHeight};
      grid-template-columns: repeat(${props.images?.length ?? 0}, 1fr);
    `

    return (
      <div ref={this.componentRef} class={containerClasses.join(' ')} style={containerStyle}>

        <div ref={this.titleRef} class={titleClasses.join(' ')}>
          {this.settings.title ? <h5>{this.settings.title}</h5> : ''}
        </div>

        {this.settings.fullscreen
          ? <div onClick={this.toggleFullscreen} class={fullscreenBtnClasses.join(' ')}>
            {this.state.fullscreen
              ? <SvgIcon name='fullscreen-close' />
              : <SvgIcon name='fullscreen-open' />}
          </div>
          : ''}

        <div ref={this.scrollableRef} onScroll={this.handleScroll} class={scrollableClasses.join(' ')}>

          <div class={imagesClasses.join(' ')} style={imagesContainerStyle}>

            {props.images?.map((media, i) => {
              return <CarouselElement
                media={media}
                visible={this.state.visibleIndex === i}
                selected={this.state.index === i}
                settings={this.settings}
                imageWrapperRef={this.imageWrapperRef}
              />
            })}

          </div>

        </div>

        {this.displayControls
          ? <div ref={this.controlsRef} class={controlsClasses.join(' ')}>

            {this.displayDots
              ? this.renderProgressDots(props.images?.length ?? 0)
              : ''}

            {this.displayArrows
              ? this.renderArrows({
                leftArrow: this.settings.leftArrow ?? false,
                rightArrow: this.settings.rightArrow ?? false,
                index: this.state.index,
                limit: (props.images?.length ?? 0) - 1,
                top: this.state.arrowsPos
              })
              : ''}

          </div>
          : ''}

      </div>
    )
  }

}

export type { Props, State, CarouselSettings, Media }
export default Carousel