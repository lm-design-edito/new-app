import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'
import Carousel, { Media, Props } from '~/components/Carousel'
import { toBoolean, toNumber, toString, toVNode } from '~/utils/cast'

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

  const {
    customClass,
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
    images
  } = options

  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (leftArrow !== undefined) { props.leftArrow = toBoolean(leftArrow) }
  if (rightArrow !== undefined) { props.rightArrow = toBoolean(rightArrow) }
  if (arrowsPosition !== undefined) { props.arrowsPosition = toString(arrowsPosition) }
  if (dots !== undefined) { props.dots = toBoolean(dots) }
  if (loop !== undefined) { props.loop = toBoolean(loop) }
  if (duration !== undefined) { props.duration = toNumber(duration) }
  if (fullscreen !== undefined) { props.fullscreen = toBoolean(fullscreen) }
  if (imageHeight !== undefined) { props.imageHeight = toNumber(imageHeight) }
  if (imageFit !== undefined) { props.imageFit = toString(imageFit) }
  if (gapValue !== undefined) { props.gapValue = toNumber(gapValue) }

  if (backgroundColor !== undefined) { props.backgroundColor = toString(backgroundColor) }
  if (imageBackgroundColor !== undefined) { props.imageBackgroundColor = toString(imageBackgroundColor) }
  if (titleColor !== undefined) { props.titleColor = toString(titleColor) }
  if (descriptionColor !== undefined) { props.descriptionColor = toString(descriptionColor) }
  if (creditsColor !== undefined) { props.creditsColor = toString(creditsColor) }
  if (dotColor !== undefined) { props.dotColor = toString(dotColor) }
  if (fullscreenButtonColor !== undefined) { props.fullscreenButtonColor = toString(fullscreenButtonColor) }
  if (arrowColor !== undefined) { props.arrowColor = toString(arrowColor) }
  if (arrowColorDisabled !== undefined) { props.arrowColorDisabled = toString(arrowColorDisabled) }
  if (arrowBackgroundColor !== undefined) { props.arrowBackgroundColor = toString(arrowBackgroundColor) }
  if (arrowBackgroundColorHover !== undefined) { props.arrowBackgroundColorHover = toString(arrowBackgroundColorHover) }

  if (title !== undefined) { props.title = toVNode(title) }
  if (credits !== undefined) { props.credits = toVNode(credits) }
  if (description !== undefined) { props.description = toVNode(description) }

  if (Array.isArray(images)) { props.images = arrayToImages(images) }
  return props
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
      if (description !== undefined) { image.description = toVNode(description) }
      if (credits !== undefined) { image.credits = toVNode(credits) }
      images.push(image)
    }
  })
  return images
}