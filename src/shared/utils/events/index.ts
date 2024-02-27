import appConfig from '~/config'
import { Apps } from '~/apps'

import { State as AudioQuoteState } from '~/apps/audioquote'

import { Globals } from '~/shared/globals'
import isRecord from '~/utils/is-record'

export namespace Events {

  export enum Type {
    SOME_EVENT = 'some-event',
    AUDIOQUOTE_ON_SUBS_LOAD = 'audioquote-on-subs-load',
    AUDIOQUOTE_ON_SUBS_ERROR = 'audioquote-on-subs-error',
    AUDIOQUOTE_ON_AUDIO_LOAD = 'audioquote-on-audio-load',
    AUDIOQUOTE_ON_AUDIO_ERROR = 'audioquote-on-audio-error',
    AUDIOQUOTE_ON_TIME_UPDATE = 'audioquote-on-time-update',
    AUDIOQUOTE_ON_START = 'audioquote-on-start',
    AUDIOQUOTE_ON_PLAY = 'audioquote-on-play',
    AUDIOQUOTE_ON_STOP = 'audioquote-on-stop',
    AUDIOQUOTE_ON_END = 'audioquote-on-end',
    AUDIOQUOTE_ON_PAUSE = 'audioquote-on-pause',
    AUDIOQUOTE_ON_LOUD = 'audioquote-on-loud',
    AUDIOQUOTE_ON_MUTE = 'audioquote-on-mute',
    AUDIOQUOTE_ON_PLAY_CLICK = 'audioquote-on-play-click',
    AUDIOQUOTE_ON_PAUSE_CLICK = 'audioquote-on-pause-click',
    AUDIOQUOTE_ON_LOUD_CLICK = 'audioquote-on-loud-click',
    AUDIOQUOTE_ON_MUTE_CLICK = 'audioquote-on-mute-click',
    AUDIOQUOTE_ON_VISIBLE = 'audioquote-on-visible',
    AUDIOQUOTE_HIDDEN = 'audioquote-hidden',
    SCRLLGNGN_ON_PAGE_CHANGE = 'scrllgngn-on-page-change',
    RESIZE_OBSERVER_ON_RESIZE = 'resize-observer-on-resize',
    INTERSECTION_OBSERVER_CALLBACK = 'intersection-observer-callback',
    EVENT_LISTENER_CALLBACK = 'event-listener-callback',
  }

  export type Payloads = {
    [Type.SOME_EVENT]: any
    [Type.AUDIOQUOTE_ON_SUBS_LOAD]: AudioQuoteState
    [Type.AUDIOQUOTE_ON_SUBS_ERROR]: any
    [Type.AUDIOQUOTE_ON_AUDIO_LOAD]: any
    [Type.AUDIOQUOTE_ON_AUDIO_ERROR]: any
    [Type.AUDIOQUOTE_ON_TIME_UPDATE]: any
    [Type.AUDIOQUOTE_ON_START]: any
    [Type.AUDIOQUOTE_ON_PLAY]: any
    [Type.AUDIOQUOTE_ON_STOP]: any
    [Type.AUDIOQUOTE_ON_END]: any
    [Type.AUDIOQUOTE_ON_PAUSE]: any
    [Type.AUDIOQUOTE_ON_LOUD]: any
    [Type.AUDIOQUOTE_ON_MUTE]: any
    [Type.AUDIOQUOTE_ON_PLAY_CLICK]: any
    [Type.AUDIOQUOTE_ON_PAUSE_CLICK]: any
    [Type.AUDIOQUOTE_ON_LOUD_CLICK]: any
    [Type.AUDIOQUOTE_ON_MUTE_CLICK]: any
    [Type.AUDIOQUOTE_ON_VISIBLE]: any
    [Type.AUDIOQUOTE_HIDDEN]: any
    [Type.SCRLLGNGN_ON_PAGE_CHANGE]: any
    [Type.RESIZE_OBSERVER_ON_RESIZE]: any
    [Type.INTERSECTION_OBSERVER_CALLBACK]: any
    [Type.EVENT_LISTENER_CALLBACK]: any
  }

  type HandlerName = string
  
  export type HandlerPayload = { // [WIP] reorganize the payload
    details: any
    type: Type
    globals: Globals.GlobalObj
    appId: string
    app: Apps.App | null
  }

  export type HandlerFunc = (payload: HandlerPayload) => any

  export type HandlersModuleExports = Record<string, HandlerFunc>

  const fetchHandlersFile = async (url: string | URL): Promise<Map<string, HandlerFunc>> => {
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    const fileUrl = new URL(url)
    const urlSchemeMatches = appConfig.eventHandlersAllowedUrlSchemes.some(scheme => {
      const schemeKeys = Object.keys(scheme) as Array<keyof URL>
      return schemeKeys.every(key => scheme[key] === fileUrl[key])
    })
    if (!urlSchemeMatches) {
      logger?.error('Events', `%cHandlers file not loaded - ${url.toString()}`, 'font-weight: 800;', 'File url must be a string and match one of these URL schemes:', appConfig.eventHandlersAllowedUrlSchemes)
      return new Map()
    }
    let moduleDataLet: unknown = undefined
    try {
      moduleDataLet = await import(fileUrl.toString())
    } catch (err) {
      logger?.error('Events', `%cHandlers file not loaded - ${url.toString()}`, 'font-weight: 800;', 'Something went wrong while fetching', err)
      return new Map()
    }
    const moduleData = moduleDataLet
    if (!isRecord(moduleData)) {
      logger?.error('Events', `%cHandlers file not loaded - ${url.toString()}`, 'font-weight: 800;', 'Exports of file should be Record<string, HandlerFunc>')
      return new Map()
    }
    const handlerExportsMap = new Map(Object
      .entries(moduleData)
      .filter((entry): entry is [string, HandlerFunc] => {
        const [_name, handler] = entry
        return typeof handler === 'function'
      }))
    Globals.dispatch(Globals.EventName.HANDLER_FILE_LOADED, { url: new URL(url), handlers: handlerExportsMap })
    logger?.log('Events', `%cHandlers file loaded - ${url.toString().trim()}`, 'font-weight: 800;')
    return handlerExportsMap
  }

  export const registeredHandlers = new Map<HandlerName, HandlerFunc>()
  
  export function registerHandler (name: HandlerName, handler: HandlerFunc) {
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    registeredHandlers.set(name, handler)
    Globals.dispatch(Globals.EventName.HANDLER_REGISTERED, { name, handler })
    logger?.log(
      'Events',
      `%cRegistered handler - ${name}`,
      'font-weight: 800;',
      `\n\n${handler.toString().trim()}`,
    )
  }

  export const fetchAndRegister = async (url: string | URL) => {
    const handlerExports = await fetchHandlersFile(url)
    handlerExports.forEach((handler, name) => registerHandler(name, handler))
    return handlerExports
  }

  export function getRegisteredHandler (name: string) {
    return registeredHandlers.get(name)
  }

  export function getRegisteredHandlerPromise (name: string): Promise<HandlerFunc> {
    return new Promise(resolve => resolve(() => {}))
  }

  export async function sequentialHandlersCall (
    handlers: HandlerFunc[],
    payload: Omit<HandlerPayload, 'globals' | 'app'>) {
    const appDetails = Apps.rendered.find(rendered => rendered.id === payload.appId)
    const app = appDetails?.app ?? null
    for (const handler of handlers) {
      await handler({
        ...payload,
        globals: Globals.globalObj,
        app
      })
    }
  }

  export async function parallelHandlersCall (
    handlers: HandlerFunc[],
    payload: Omit<HandlerPayload, 'globals' | 'app'>) {
    const calls: any[] = []
    const appDetails = Apps.rendered.find(rendered => rendered.id === payload.appId)
    const app = appDetails?.app ?? null
    for (const handler of handlers) {
      calls.push(handler({
        ...payload,
        globals: Globals.globalObj,
        app
      }))
    }
    await Promise.all(calls)
  }

  // [WIP] New events stuff
  export type OtherHandlerPayload<T extends Type> = Payloads[T]
  export type OtherHandlerDetails<T extends Type> = {
    type: T
    initiator: { id: NonNullable<(typeof Apps.rendered)[number]['id']> }
    globals: Globals.GlobalObj
  }
  export type OtherHandlerFunc<T extends Type> = (payload: OtherHandlerPayload<T>, details: OtherHandlerDetails<T>) => any

  export async function otherSequentialHandlersCall<T extends Type> (
    handlers: OtherHandlerFunc<T>[],
    payload: OtherHandlerPayload<T>,
    details: Omit<OtherHandlerDetails<T>, 'globals'>) {
    const appData = Apps.rendered.find(rendered => rendered.id === details.initiator.id)
    if (appData === undefined) return;
    for (const handler of handlers) {
      await handler(payload, {
        ...details,
        globals: { ...Globals.globalObj }
      })
    }
  }

  export async function otherParallelHandlersCall<T extends Type> (
    handlers: OtherHandlerFunc<T>[],
    payload: OtherHandlerPayload<T>,
    details: Omit<OtherHandlerDetails<T>, 'globals'>) {
    const appData = Apps.rendered.find(rendered => rendered.id === details.initiator.id)
    if (appData === undefined) return;
    const calls = handlers.map(handler => {
      return handler(payload, {
        ...details,
        globals: { ...Globals.globalObj }
      })
    })
    await Promise.all(calls)
  }

  export function otherGetRegisteredHandler (name: string) {
    const found = registeredHandlers.get(name) as OtherHandlerFunc<Type> | undefined
    return found
  }
}
