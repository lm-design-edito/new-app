import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import { toArray, toNumber, toString } from '~/utils/cast'
import IntersectionObserverComponent, { Props, IOE, IO } from '~/components/IntersectionObserver'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: IntersectionObserverComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    rootMargin: i => Apps.ifNotUndefinedHelper(i, toString),
    threshold: i => Apps.ifNotUndefinedHelper(i, i => toArray(i).map(toNumber)),
    // Handlers
    onIntersection: i => Apps.makeHandlerHelper<{
      ioEntry?: IOE | undefined
      observer: IO
    }>(Events.Type.INTERSECTION_OBSERVER_CALLBACK, i, id)
  }) ?? {}
}
