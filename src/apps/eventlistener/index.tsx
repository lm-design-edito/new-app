import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import { toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'
import EventListenerComponent, { Props } from '~/components/EventListener'
import { Config } from '~/shared/config'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)

  const updateProps = async () => {
    const updatedProps = await toProps(unknownProps, id)
    const app = Apps.getAppById(id);
    if (app) {
      Apps.updatePropsOf([app], { callback: updatedProps.callback })
    }
  }

  const onAppRendered = (e:  Apps.AppEvents[Apps.AppEventsTypes.APP_RENDERED]) => {
    if (e.detail && e.detail.appId === id) {
      window.removeEventListener(Apps.AppEventsTypes.APP_RENDERED, onAppRendered)
      updateProps()
    }
  }
  if (!Apps.getAppById(id)) {
    window.addEventListener(Apps.AppEventsTypes.APP_RENDERED, onAppRendered)
  }
  window.addEventListener(Config.ConfigEvents.HANDLERS_REGISTERED, updateProps)

  return { props, Component: EventListenerComponent }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    appId: () => id,
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
