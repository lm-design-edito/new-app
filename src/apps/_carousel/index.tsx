import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { recordFormat } from '@design-edito/tools/agnostic/objects/record-format'
import { Apps } from '~/apps'
import Carousel, { Props, Media } from '~/components/_Carousel'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Carousel }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    leftArrow: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    rightArrow: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    arrowsPosition: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    dots: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    loop: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    duration: i => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
    fullscreen: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    imageHeight: i => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
    imageFit: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    gapValue: i => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
    backgroundColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    imageBackgroundColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    titleColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    descriptionColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    creditsColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    dotColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    fullscreenButtonColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    arrowColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    arrowColorDisabled: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    arrowBackgroundColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    arrowBackgroundColorHover: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
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
      url: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      mobileUrl: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      type: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      imageFit: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      description: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      credits: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper)
    })
    extractedImages.push(extractedImage)
  }
  return extractedImages
}
