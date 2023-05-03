import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'

import Carousel, { CarouselSettings, Media, Props } from '~/components/Carousel'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function CarouselApp({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Carousel {...props} />
  render(app, root)
  silentLogger?.log('carousel-app/rendered', props, root)
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
function optionsToProps(options: Options): Props {
  const props: Props = {}

  const {
    settings,
    images
  } = options

  if (typeof settings === 'object'
    && settings !== null) { props.settings = objectToSettings(settings) }
  if (Array.isArray(images)) { props.images = arrayToImages(images) }

  console.log(props)

  return props
}

function objectToSettings(object: any): CarouselSettings {
  const settings: CarouselSettings = {}

  const {
    leftArrow,
    rightArrow,
    arrowsPosition,
    dots,
    loop,
    duration,
    fullscreen,
    imageHeight,
    imageFit,
    gapValue,
    backgroundColor,
    imageBackgroundColor,
    titleColor,
    descriptionColor,
    creditsColor,
    dotColor,
    fullscreenButtonColor,
    arrowColor,
    arrowColorDisabled,
    arrowBackgroundColor,
    arrowBackgroundColorHover,
    title,
    credits,
    description,
  } = object

  if (typeof leftArrow === 'boolean') { settings.leftArrow = leftArrow }
  if (typeof rightArrow === 'boolean') { settings.rightArrow = rightArrow }
  if (arrowsPosition === 'center' || arrowsPosition === 'bottom') { settings.arrowsPosition = arrowsPosition }
  if (typeof dots === 'boolean') { settings.dots = dots }
  if (typeof loop === 'boolean') { settings.loop = loop }
  if (typeof duration === 'number') { settings.duration = duration }
  if (typeof fullscreen === 'boolean') { settings.fullscreen = fullscreen }
  if (typeof imageHeight === 'number') { settings.imageHeight = imageHeight }
  if (imageFit === 'cover' || imageFit === 'contain') { settings.imageFit = imageFit }
  if (typeof gapValue === 'number') { settings.gapValue = gapValue }

  if (typeof backgroundColor === 'string') { settings.backgroundColor = backgroundColor }
  if (typeof imageBackgroundColor === 'string') { settings.imageBackgroundColor = imageBackgroundColor }
  if (typeof titleColor === 'string') { settings.titleColor = titleColor }
  if (typeof descriptionColor === 'string') { settings.descriptionColor = descriptionColor }
  if (typeof creditsColor === 'string') { settings.creditsColor = creditsColor }
  if (typeof dotColor === 'string') { settings.dotColor = dotColor }
  if (typeof fullscreenButtonColor === 'string') { settings.fullscreenButtonColor = fullscreenButtonColor }
  if (typeof arrowColor === 'string') { settings.arrowColor = arrowColor }
  if (typeof arrowColorDisabled === 'string') { settings.arrowColorDisabled = arrowColorDisabled }
  if (typeof arrowBackgroundColor === 'string') { settings.arrowBackgroundColor = arrowBackgroundColor }
  if (typeof arrowBackgroundColorHover === 'string') { settings.arrowBackgroundColorHover = arrowBackgroundColorHover }

  if (typeof title === 'string') { settings.title = title }
  if (typeof credits === 'string') { settings.credits = credits }
  if (typeof description === 'string') { settings.description = description }

  return settings
}

function arrayToImages(array: unknown[]): Media[] {
  const images: Media[] = []

  array.forEach((imageData: any) => {
    if (typeof imageData === 'object'
      && imageData !== null) {

      const image: Media = {}

      const {
        url,
        mobileUrl,
        type,
        imageFit,
        description,
        credits,
      } = imageData

      if (typeof url === 'string') { image.url = url }
      if (typeof mobileUrl === 'string') { image.mobileUrl = mobileUrl }
      if (type === 'image' || type === 'video') { image.type = type }
      if (imageFit === 'cover' || imageFit === 'contain') { image.imageFit = imageFit }
      if (typeof description === 'string') { image.description = description }
      if (typeof credits === 'string') { image.credits = credits }

      images.push(image)
    }
  })

  return images
}