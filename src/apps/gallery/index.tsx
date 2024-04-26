import { Apps } from '~/apps'
import { toBoolean, toString, toArray } from '~/utils/cast'
import Gallery, { Props, State } from '~/components/Gallery'
import { Events } from '~/shared'

export { Props, State }

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
    scrollerWidth: i => Apps.ifNotUndefinedHelper(i, toString),
    onSlideChange: i => Apps.makeHandlerHelper<State>(Events.Type.GALLERY_SLIDE_CHANGE, i, id),
    onPrevClick: i => Apps.makeHandlerHelper<State>(Events.Type.GALLERY_PREV_CLICK, i, id),
    onNextClick: i => Apps.makeHandlerHelper<State>(Events.Type.GALLERY_NEXT_CLICK, i, id),
    onDotClick: i => Apps.makeHandlerHelper<State & { dotPos: number }>(Events.Type.GALLERY_DOT_CLICK, i, id)
  }) ?? {}
}
