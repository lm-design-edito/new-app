import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import ResizeObserverComponent, { Props } from '~/components/ResizeObserver'
import { toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: ResizeObserverComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    // Handlers
    onResize: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
      .map(e => Events.getRegisteredHandler(toString(e)))
      .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (entries?: ResizeObserverEntry[]) => {
        Events.sequentialHandlersCall(handlers, {
          details: { entries },
          type: Events.Type.RESIZE_OBSERVER_RESIZE,
          appId: id
        })
      }
    }
  })
  return props
}
