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
  if (!isRecord(input)) return {}
  return await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    leftArrow: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    rightArrow: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    arrowsPosition: (i: unknown) => i !== undefined ? toString(i): undefined,
    dots: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    loop: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    duration: (i: unknown) => i !== undefined ? toNumber(i) : undefined,
    height: (i: unknown) => i !== undefined ? toString(i) : undefined,
    imageFit: (i: unknown) => i !== undefined ? toString(i) : undefined,
    toggleDescription: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
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
