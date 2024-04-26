import { Apps } from '~/apps'
import { toString } from '~/utils/cast'
import Navigation, { Props } from '~/components/Navigation'
import isRecord from '~/utils/is-record'

export { Props }

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Navigation }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    activeItemId: i => Apps.ifNotUndefinedHelper(i, i => i === null ? null : toString(i)),
    items: i => Apps.ifArrayHelper(i, i => arrayToItems(i, id)),
    galleryScrollerWidth: i => Apps.ifNotUndefinedHelper(i, toString)
  }) ?? {}
}

async function arrayToItems (input: unknown[], id: string) {
  const withUndefined = await Promise.all(input.map(async itemData => {
    if (!isRecord(itemData)) return;
    const { id, content } = itemData
    return {
      id: toString(id),
      content: await Apps.toStringOrVNodeHelper(content)
    }
  }))
  const filtered = withUndefined.filter((e): e is NonNullable<typeof e> => e !== undefined)  
  return filtered
}
