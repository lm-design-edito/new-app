import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import IntersectionObserverComponent, { Props, IOE, IO } from '~/components/IntersectionObserver'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: IntersectionObserverComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    rootMargin: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    threshold: i => Apps.ifNotUndefinedHelper(i, i => Cast.toArray(i).map(Cast.toNumber)),

    // Handlers
    onIntersection: i => Apps.makeHandlerHelper<{
      ioEntry?: IOE | undefined
      observer: IO
    }>(Events.Type.INTERSECTION_OBSERVER_CALLBACK, i, id)
  }) ?? {}
}
