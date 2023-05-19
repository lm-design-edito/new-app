import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'
import Slideshow, { SlideshowSettings, Media, Props } from '~/components/Slideshow'
import { toBoolean, toNumber, toString } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function SlideshowApp({
  options,
  root,
  silentLogger,
  pageConfig
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
  const { settings, images } = options
  if (typeof settings === 'object'
    && settings !== null) { props.settings = objectToSettings(settings) }
  if (Array.isArray(images)) { props.images = arrayToImages(images) }
  return props
}

// wip TS
function objectToSettings(object: any): SlideshowSettings {
  const settings: SlideshowSettings = {}
  const {
    leftArrow,
    rightArrow,
    dots,
    loop,
    duration,
    height,
    imageFit,
    toggleDescriptionBtn,
    credits,
    description
  } = object
  if (leftArrow !== undefined) { settings.leftArrow = toBoolean(leftArrow) }
  if (rightArrow !== undefined) { settings.rightArrow = toBoolean(rightArrow) }
  if (dots !== undefined) { settings.dots = toBoolean(dots) }
  if (loop !== undefined) { settings.loop = toBoolean(loop) }
  if (duration !== undefined) { settings.duration = toNumber(duration) }
  if (height !== undefined) { settings.height = toString(height) }
  if (imageFit !== undefined) { settings.imageFit = toString(imageFit) }
  if (toggleDescriptionBtn !== undefined) { settings.toggleDescriptionBtn = toBoolean(toggleDescriptionBtn) }
  if (credits !== undefined) { settings.credits = toString(credits) }
  if (description !== undefined) { settings.description = toString(description) }
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