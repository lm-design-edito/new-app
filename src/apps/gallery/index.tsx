import { Apps } from '~/apps'
import { toBoolean, toString, toArray } from '~/utils/cast'
import Gallery, { Props } from '~/components/Gallery'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Gallery }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    itemsContent: i => Apps.ifNotUndefinedHelper(i, async i => await Promise.all(toArray(i).map(Apps.toStringOrVNodeHelper))),
    prevButtonContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    nextButtonContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    snapScroll: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    scrollerWidth: i => Apps.ifNotUndefinedHelper(i, toString)
  }) ?? {}
}
