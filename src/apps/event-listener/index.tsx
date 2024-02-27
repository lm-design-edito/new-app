import { Apps } from '~/apps'
import { Globals } from '~/shared/globals'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import { toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'
import { throttle } from '~/utils/throttle-debounce'
import EventListenerComponent, { Props } from '~/components/EventListener'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)

  const processPropsAgain = async () => {
    const newProps = await toProps(unknownProps, id)
    const thisApp = Apps.getAppById(id)
    if (thisApp !== undefined) Apps.updatePropsOf([thisApp], { callback: newProps.callback })
  }
  const processPropsAgainThrottler = throttle(processPropsAgain, 100)
  const processPropsAgainThrottled = processPropsAgainThrottler.throttled

  const onThisAppMounted = (e: Globals.Events[Globals.EventName.APP_MOUNTED]) => {
    if (e.detail.id !== id) return;
    Globals.removeListener(Globals.EventName.APP_MOUNTED, onThisAppMounted)
    processPropsAgain()
  }

  const onThisAppUnmounted = (e: Globals.Events[Globals.EventName.APP_UNMOUNTED]) => {
    if (e.detail.id !== id) return;
    Globals.removeListener(Globals.EventName.APP_UNMOUNTED, onThisAppUnmounted)
    Globals.removeListener(Globals.EventName.HANDLER_REGISTERED, processPropsAgain)
  }

  Globals.addListener(Globals.EventName.HANDLER_REGISTERED, processPropsAgainThrottled)
  Globals.addListener(Globals.EventName.APP_MOUNTED, onThisAppMounted)
  Globals.addListener(Globals.EventName.APP_UNMOUNTED, onThisAppUnmounted)

  return { props, Component: EventListenerComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customWrapperClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    selector: (i: unknown) => i !== undefined ? toString(i) : undefined,
    types: (i: unknown) => i !== undefined ? (Array.isArray(i) ? i.map((_i) => toString(_i)) : [toString(i)]) : undefined,
    // // Handlers
    callback: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
      .map(e => Events.getRegisteredHandler(toString(e)))
      .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (e: Event) => {
        Events.sequentialHandlersCall(handlers, {
          details: { e },
          type: Events.Type.EVENT_LISTENER_CALLBACK,
          appId: id
        })
      }
    }
  })
  return props
}
