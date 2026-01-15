import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { recordFormat } from '@design-edito/tools/agnostic/objects/record-format'
import { Apps } from '~/apps'
import Slideshow, { Props, Media } from '~/components/_Slideshow'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Slideshow }
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
    height: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    imageFit: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    toggleDescription: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
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
