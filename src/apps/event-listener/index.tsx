import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import isRecord from '~/utils/is-record'
import { toString } from '~/utils/cast'
import recordFormat from '~/utils/record-format'
import EventListenerComponent, { Props } from '~/components/EventListener'
import { Config } from '~/shared/config'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)

  const processPropsAgain = async () => {
    const newProps = await toProps(unknownProps, id)
    const thisApp = Apps.getAppById(id)
    if (thisApp !== undefined) Apps.updatePropsOf([thisApp], { callback: newProps.callback })
  }

  window.addEventListener(Config.EventName.HANDLERS_REGISTERED, processPropsAgain)

  // [@Léa] Donc ci-dessous, on attend d'avoir l'info que l'app a été rendue
  // pour recalculer les props right ? Pas sûr de comprendre pourquoi
  const onThisAppRendered = (e: Apps.Events[Apps.EventName.APP_RENDERED]) => {
    if (e.detail.appId !== id) return;
    window.removeEventListener(Apps.EventName.APP_RENDERED, onThisAppRendered)
    processPropsAgain()
  }

  if (Apps.getAppById(id) === undefined) {
    // Apps.getAppById(id) should always be undefined since
    // renderer is only called once, obvisously before the app is rendered
    window.addEventListener(Apps.EventName.APP_RENDERED, onThisAppRendered)
  }
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
          type: Events.Type.EVENT_LISTENER_CALLBACK,
          appId: id
        })
      }
    }
  })
  return props
}
