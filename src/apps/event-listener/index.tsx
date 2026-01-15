import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import EventListenerComponent, { Props } from '~/components/EventListener'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: EventListenerComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    targetSelector: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    eventTypes: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrStringsHelper),
    
    // Handlers
    onEvent: i => Apps.makeHandlerHelper<Event>(Events.Type.EVENT_LISTENER_EVENT, i, id)
  }) ?? {}
}
