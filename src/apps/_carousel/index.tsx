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
  if (!isRecord(input)) return {}
  return await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    leftArrow: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    rightArrow: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    arrowsPosition: (i: unknown) => i !== undefined ? toString(i): undefined,
    dots: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    loop: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    duration: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    fullscreen: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    imageHeight: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    imageFit: (i: unknown) => i !== undefined ? toString(i) : undefined,
    gapValue: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    backgroundColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    imageBackgroundColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    titleColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    descriptionColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    creditsColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    dotColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    fullscreenButtonColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    arrowColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    arrowColorDisabled: (i: unknown) => i !== undefined ? toString(i) : undefined,
    arrowBackgroundColor: (i: unknown) => i !== undefined ? toString(i) : undefined,
    arrowBackgroundColorHover: (i: unknown) => i !== undefined ? toString(i) : undefined,
    title: (i: undefined) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    credits: (i: undefined) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    description: (i: undefined) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    images: async (i: unknown) => Array.isArray(i) ? await arrayToImages(i, id) : undefined
  })
}

async function arrayToImages (array: unknown[], id: string): Promise<Media[]> {
  const extractedImages: Media[] = []
  for (const imageData of array) {
    if (!isRecord(imageData)) continue
    const extractedImage: Media = await recordFormat(imageData, {
      url: (i: unknown) => i !== undefined ? toString(i) : undefined,
      mobileUrl: (i: unknown) => i !== undefined ? toString(i) : undefined,
      type: (i: unknown) => i !== undefined ? toString(i) : undefined,
      imageFit: (i: unknown) => i !== undefined ? toString(i) : undefined,
      description: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      credits: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined
    })
    extractedImages.push(extractedImage)
  }
  return extractedImages
}
