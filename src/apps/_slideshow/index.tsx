import { Apps } from '~/apps'
import { toString, toBoolean, toNumber } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Slideshow, { Props, Media } from '~/components/_Slideshow'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Slideshow }
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
    height: i => Apps.ifNotUndefinedHelper(i, toString),
    imageFit: i => Apps.ifNotUndefinedHelper(i, toString),
    toggleDescription: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    credits: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    description: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    images: async i => Array.isArray(i) ? await arrayToImages(i, id) : undefined
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
