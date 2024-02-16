import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import { toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'
import EventListenerComponent, { Props } from '~/components/EventListener'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: EventListenerComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customWrapperClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    types: (i: unknown) => i !== undefined ? (Array.isArray(i) ? i.map((_i) => toString(_i)) : [toString(i)]) : undefined,
    // // Handlers
    callback: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
      .map(e => Events.getRegisteredHandler(toString(e)))
      .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (e: Event) => {
        Events.syncCallHandlers(handlers, {
          details: { e },
          type: Events.Type.EVENTLISTENER_CALLBACK,
          appId: id
        })
      }
    }
  })
  return props
}
