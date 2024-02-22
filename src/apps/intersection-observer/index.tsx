import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import { toNumber, toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'
import IntersectionObserverComponent, { Props, IO, IOE } from '~/components/IntersectionObserver'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: IntersectionObserverComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    rootMargin: (i: unknown) => i !== undefined ? toString(i) : undefined,
    threshold: (i: unknown) => i !== undefined ? Array.isArray(i) ? i.map((_i) => toNumber(_i)) : toNumber(i) : undefined,
    // Handlers
    callback: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
      .map(e => Events.getRegisteredHandler(toString(e)))
      .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (ioEntry: IOE|undefined, observer: IO) => {
        Events.syncCallHandlers(handlers, {
          details: { ioEntry, observer },
          type: Events.Type.INTERSECTION_OBSERVER_CALLBACK,
          appId: id
        })
      }
    }
  })
  return props
}
