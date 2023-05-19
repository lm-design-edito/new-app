import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'
import Carousel, { CarouselSettings, Media, Props } from '~/components/Carousel'
import { toBoolean, toNumber, toString } from '~/utils/cast'

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
  silentLogger?.log(
    'carousel-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps (options: Options): Props {
  const props: Props = {}
  const { settings, images } = options
  if (typeof settings === 'object'
    && settings !== null) { props.settings = objectToSettings(settings) }
  if (Array.isArray(images)) { props.images = arrayToImages(images) }
  return props
}

function objectToSettings (object: any): CarouselSettings {
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

  if (leftArrow !== undefined) { settings.leftArrow = toBoolean(leftArrow) }
  if (rightArrow !== undefined) { settings.rightArrow = toBoolean(rightArrow) }
  if (arrowsPosition !== undefined) { settings.arrowsPosition = toString(arrowsPosition) }
  if (dots !== undefined) { settings.dots = toBoolean(dots) }
  if (loop !== undefined) { settings.loop = toBoolean(loop) }
  if (duration !== undefined) { settings.duration = toNumber(duration) }
  if (fullscreen !== undefined) { settings.fullscreen = toBoolean(fullscreen) }
  if (imageHeight !== undefined) { settings.imageHeight = toNumber(imageHeight) }
  if (imageFit !== undefined) { settings.imageFit = toString(imageFit) }
  if (gapValue !== undefined) { settings.gapValue = toNumber(gapValue) }

  if (backgroundColor !== undefined) { settings.backgroundColor = toString(backgroundColor) }
  if (imageBackgroundColor !== undefined) { settings.imageBackgroundColor = toString(imageBackgroundColor) }
  if (titleColor !== undefined) { settings.titleColor = toString(titleColor) }
  if (descriptionColor !== undefined) { settings.descriptionColor = toString(descriptionColor) }
  if (creditsColor !== undefined) { settings.creditsColor = toString(creditsColor) }
  if (dotColor !== undefined) { settings.dotColor = toString(dotColor) }
  if (fullscreenButtonColor !== undefined) { settings.fullscreenButtonColor = toString(fullscreenButtonColor) }
  if (arrowColor !== undefined) { settings.arrowColor = toString(arrowColor) }
  if (arrowColorDisabled !== undefined) { settings.arrowColorDisabled = toString(arrowColorDisabled) }
  if (arrowBackgroundColor !== undefined) { settings.arrowBackgroundColor = toString(arrowBackgroundColor) }
  if (arrowBackgroundColorHover !== undefined) { settings.arrowBackgroundColorHover = toString(arrowBackgroundColorHover) }

  if (title !== undefined) { settings.title = toString(title) }
  if (credits !== undefined) { settings.credits = toString(credits) }
  if (description !== undefined) { settings.description = toString(description) }

  return settings
}

function arrayToImages (array: unknown[]): Media[] {
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
      if (url !== undefined) { image.url = toString(url) }
      if (mobileUrl !== undefined) { image.mobileUrl = toString(mobileUrl) }
      if (type !== undefined) { image.type = toString(type) }
      if (imageFit !== undefined) { image.imageFit = toString(imageFit) }
      if (description !== undefined) { image.description = toString(description) }
      if (credits !== undefined) { image.credits = toString(credits) }
      images.push(image)
    }
  })
  return images
}