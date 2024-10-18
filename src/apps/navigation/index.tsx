import { Apps } from '~/apps'
import { Events } from '~/shared'
import { toString } from '~/utils/cast'
import isRecord from '@design-edito/tools/agnostic/objects/is-record'
import Navigation, { Props } from '~/components/Navigation'

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
  const appId = id
  const withUndefined = await Promise.all(input.map(async itemData => {
    if (!isRecord(itemData)) return;
    const { id: itemId, content, onClick } = itemData
    return {
      id: toString(itemId),
      content: await Apps.toStringOrVNodeHelper(content),
      onClick: Apps.makeHandlerHelper(Events.Type.NAVIGATION_ITEM_CLICK, onClick, appId)
    }
  }))
  const filtered = withUndefined.filter((e): e is NonNullable<typeof e> => e !== undefined)  
  return filtered
}
