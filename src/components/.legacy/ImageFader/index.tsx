import { Component, JSX } from 'preact'
import bem from '~/utils/bem'
import './styles.scss'

interface Props {
  className?: string
  style?: JSX.CSSProperties
  preload?: string[]
  current?: string
  animationDuration?: string
}

interface State {
  current?: string
  previous?: string
  images: string[]
}

class ImageFader extends Component<Props, State> {
  static clss = 'lm-image-fader'
  clss = ImageFader.clss
  state: State = { images: [] }
  $preCurrentImage: HTMLDivElement|null = null

  static getDerivedStateFromProps (props: Props, state: State) {
    if (props.current !== state.current) {
      return {
        previous: state.current,
        current: props.current,
        images: [...new Set([
          ...state.images,
          props.current
        ])]
      }
    }
    return null
  }

  componentDidMount () { this.fadeCurrentImage() }
  componentDidUpdate () { this.fadeCurrentImage() }

  fadeCurrentImage () {
    window.setTimeout(() => {
      const { $preCurrentImage } = this
      if ($preCurrentImage === null) return
      const imgClass = bem(this.clss).elt('image')
      const preCurrImgClass = `${imgClass.value}_pre-current`
      const currImgClass = `${imgClass.value}_current`
      $preCurrentImage.classList.remove(preCurrImgClass)
      $preCurrentImage.classList.add(currImgClass)
    }, 500)
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props, state } = this

    /* Classes and style */
    const wrapperClasses = bem(props.className).block(this.clss)
    const wrapperStyle: JSX.CSSProperties = {
      ...props.style,
      '--animation-duration': props.animationDuration ?? '500ms'
    }

    const toPreload = [...new Set(props.preload)]
    const preloaderClasses = bem(this.clss).elt('preload')
    const imagesClasses = bem(this.clss).elt('images')
    const imgClass = bem(this.clss).elt('image')
    const preCurrImgClass = imgClass.mod('pre-current')
    const currImgClass = imgClass.mod('current')
    const sglImgClass = currImgClass.mod('single')
    const prevImgClass = imgClass.mod('previous')
    const hideImgClass = imgClass.mod('hide')

    /* Display */
    return (
      <div
        style={wrapperStyle}
        className={wrapperClasses.value}>
        <div
          className={preloaderClasses.value}>
          {toPreload.map(url => <img src={url} />)}
        </div>
        <div
          className={imagesClasses.value}>
          {state.images.map(image => {
            if (state.images.length < 2) return <img src={image} className={sglImgClass.value} />
            if (image === state.current) return <img src={image} className={preCurrImgClass.value} ref={n => { this.$preCurrentImage = n }} />
            if (image === state.previous) return <img src={image} className={prevImgClass.value} />
            return <img src={image} className={hideImgClass.value} />
          })}
        </div>
      </div>
    )
  }
}

export type { Props, State }
export default ImageFader
