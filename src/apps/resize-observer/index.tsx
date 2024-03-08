import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import ResizeObserverComponent, { Props } from '~/components/ResizeObserver'
import { toString } from '~/utils/cast'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: ResizeObserverComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    // Handlers
    onResize: i => Apps.makeHandlerHelper<ResizeObserverEntry[]>(Events.Type.RESIZE_OBSERVER_RESIZE, i, id)
  }) ?? {}
}
