import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'
import Slideshow, { Media, Props } from '~/components/Slideshow'
import { toBoolean, toNumber, toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function SlideshowApp({
  options,
  root,
  silentLogger
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Slideshow {...props} />
  render(app, root)
  silentLogger?.log(
    'slideshow-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps(options: Options): Props {
  const props: Props = {}

  const {
    customClass,
    leftArrow,
    rightArrow,
    dots,
    loop,
    duration,
    height,
    imageFit,
    toggleDescriptionBtn,
    credits,
    description,
    images
  } = options

  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (leftArrow !== undefined) { props.leftArrow = toBoolean(leftArrow) }
  if (rightArrow !== undefined) { props.rightArrow = toBoolean(rightArrow) }
  if (dots !== undefined) { props.dots = toBoolean(dots) }
  if (loop !== undefined) { props.loop = toBoolean(loop) }
  if (duration !== undefined) { props.duration = toNumber(duration) }
  if (height !== undefined) { props.height = toString(height) }
  if (imageFit !== undefined) { props.imageFit = toString(imageFit) }
  if (toggleDescriptionBtn !== undefined) { props.toggleDescriptionBtn = toBoolean(toggleDescriptionBtn) }
  if (credits !== undefined) { props.credits = toVNode(credits) }
  if (description !== undefined) { props.description = toVNode(description) }
  if (Array.isArray(images)) { props.images = arrayToImages(images) }

  return props
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