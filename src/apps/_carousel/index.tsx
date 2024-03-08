import { Apps } from '~/apps'
import { toString, toBoolean, toNumber } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Carousel, { Props, Media } from '~/components/_Carousel'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Carousel }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    leftArrow: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    rightArrow: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    arrowsPosition: i => Apps.ifNotUndefinedHelper(i, toString),
    dots: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    loop: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    duration: i => Apps.ifNotUndefinedHelper(i, toNumber),
    fullscreen: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    imageHeight: i => Apps.ifNotUndefinedHelper(i, toNumber),
    imageFit: i => Apps.ifNotUndefinedHelper(i, toString),
    gapValue: i => Apps.ifNotUndefinedHelper(i, toNumber),
    backgroundColor: i => Apps.ifNotUndefinedHelper(i, toString),
    imageBackgroundColor: i => Apps.ifNotUndefinedHelper(i, toString),
    titleColor: i => Apps.ifNotUndefinedHelper(i, toString),
    descriptionColor: i => Apps.ifNotUndefinedHelper(i, toString),
    creditsColor: i => Apps.ifNotUndefinedHelper(i, toString),
    dotColor: i => Apps.ifNotUndefinedHelper(i, toString),
    fullscreenButtonColor: i => Apps.ifNotUndefinedHelper(i, toString),
    arrowColor: i => Apps.ifNotUndefinedHelper(i, toString),
    arrowColorDisabled: i => Apps.ifNotUndefinedHelper(i, toString),
    arrowBackgroundColor: i => Apps.ifNotUndefinedHelper(i, toString),
    arrowBackgroundColorHover: i => Apps.ifNotUndefinedHelper(i, toString),
    title: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    credits: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    description: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    images: i => Apps.ifArrayHelper(i, i => arrayToImages(i, id))
  }) ?? {}
}

async function arrayToImages (array: unknown[], id: string): Promise<Media[]> {
  const extractedImages: Media[] = []
  for (const imageData of array) {
    if (!isRecord(imageData)) continue
    const extractedImage: Media = await recordFormat(imageData, {
      url: i => Apps.ifNotUndefinedHelper(i, toString),
      mobileUrl: i => Apps.ifNotUndefinedHelper(i, toString),
      type: i => Apps.ifNotUndefinedHelper(i, toString),
      imageFit: i => Apps.ifNotUndefinedHelper(i, toString),
      description: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      credits: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper)
    })
    extractedImages.push(extractedImage)
  }
  return extractedImages
}
