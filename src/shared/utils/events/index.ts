import appConfig from '~/config'
import { Globals } from '~/shared/globals'
import isRecord from '~/utils/is-record'

export namespace Events {

  export enum Type {
    /* Audioquote */
    AUDIOQUOTE_SUBS_LOAD = 'audioquote-subs-load',
    AUDIOQUOTE_SUBS_ERROR = 'audioquote-subs-error',
    AUDIOQUOTE_AUDIO_LOAD = 'audioquote-audio-load',
    AUDIOQUOTE_AUDIO_ERROR = 'audioquote-audio-error',
    AUDIOQUOTE_TIME_UPDATE = 'audioquote-time-update',
    AUDIOQUOTE_START = 'audioquote-start',
    AUDIOQUOTE_PLAY = 'audioquote-play',
    AUDIOQUOTE_STOP = 'audioquote-stop',
    AUDIOQUOTE_END = 'audioquote-end',
    AUDIOQUOTE_PAUSE = 'audioquote-pause',
    AUDIOQUOTE_LOUD = 'audioquote-loud',
    AUDIOQUOTE_MUTE = 'audioquote-mute',
    AUDIOQUOTE_PLAY_CLICK = 'audioquote-play-click',
    AUDIOQUOTE_PAUSE_CLICK = 'audioquote-pause-click',
    AUDIOQUOTE_LOUD_CLICK = 'audioquote-loud-click',
    AUDIOQUOTE_MUTE_CLICK = 'audioquote-mute-click',
    AUDIOQUOTE_VISIBLE = 'audioquote-visible',
    AUDIOQUOTE_HIDDEN = 'audioquote-hidden',
    /* Button */
    BUTTON_CLICK = 'button-click',
    /* Checkbox or radio */
    CHECKBOX_OR_RADIO_CHANGE = 'checkbox-or-radio-change',
    /* Event Listener */
    EVENT_LISTENER_EVENT = 'event-listener-event',
    /* Intersection Observer */
    INTERSECTION_OBSERVER_CALLBACK = 'intersection-observer-callback',
    /* Resize Observer */
    RESIZE_OBSERVER_RESIZE = 'resize-observer-resize',
    /* Scrllgngn */
    SCRLLGNGN_PAGE_CHANGE = 'scrllgngn-page-change',
    /* Tab */
    TAB_CLICK = 'tab-click',
    /* Tabs */
    TABS_TAB_CLICK = 'tabs-tab-click',
    /* Toggle */
    TOGGLE_TOGGLED = 'toggle-toggled'
  }

  export type HandlerName = string
  
  export type HandlerDetails = {
    type: Type
    initiator: { id: string }
    globals: Globals.GlobalObj
  }
  
  export type HandlerFunc = (payload: unknown, details: HandlerDetails) => any

  export type HandlersModuleExports = Record<string, HandlerFunc>

  const fetchHandlersFile = async (url: string | URL): Promise<Map<string, HandlerFunc>> => {
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    const fileUrl = new URL(url)
    const urlSchemeMatches = appConfig.eventHandlersAllowedUrlSchemes.some(scheme => {
      const schemeKeys = Object.keys(scheme) as Array<keyof URL>
      return schemeKeys.every(key => scheme[key] === fileUrl[key])
    })
    if (!urlSchemeMatches) {
      logger?.error(
        'Events',
        `%cHandlers file not loaded - ${url.toString()}`,
        'font-weight: 800;',
        'File url must be a string and match one of these URL schemes:',
        appConfig.eventHandlersAllowedUrlSchemes
      )
      return new Map()
    }
    let moduleDataLet: unknown = undefined
    try {
      moduleDataLet = await import(fileUrl.toString())
    } catch (err) {
      logger?.error(
        'Events',
        `%cHandlers file not loaded - ${url.toString()}`,
        'font-weight: 800;',
        'Something went wrong while fetching',
        err
      )
      return new Map()
    }
    const moduleData = moduleDataLet
    if (!isRecord(moduleData)) {
      logger?.error(
        'Events',
        `%cHandlers file not loaded - ${url.toString()}`,
        'font-weight: 800;',
        'Exports of file should be Record<string, HandlerFunc>'
      )
      return new Map()
    }
    const handlerExportsMap = new Map(Object
      .entries(moduleData)
      .filter((entry): entry is [string, HandlerFunc] => {
        const [_name, handler] = entry
        return typeof handler === 'function'
      }))
    Globals.dispatch(Globals.EventName.HANDLER_FILE_LOADED, { url: new URL(url), handlers: handlerExportsMap })
    logger?.log(
      'Events',
      `%cHandlers file loaded - ${url.toString().trim()}`,
      'font-weight: 800;'
    )
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

  export async function sequentialHandlersCall (
    handlers: HandlerFunc | string | Array<HandlerFunc | string>,
    payload: unknown,
    details: Omit<HandlerDetails, 'globals'>) {
    const handlersAsArr = Array.isArray(handlers) ? handlers : [handlers]
    for (const handler of handlersAsArr) {
      const actualHandler = typeof handler === 'string'
        ? getRegisteredHandler(handler)
        : handler
      if (actualHandler === undefined) continue
      await actualHandler(payload, {
        ...details,
        globals: { ...Globals.globalObj }
      })
    }
  }

  export async function parallelHandlersCall (
    handlers: HandlerFunc | string | Array<HandlerFunc | string>,
    payload: unknown,
    details: Omit<HandlerDetails, 'globals'>) {
    const handlersAsArr = Array.isArray(handlers) ? handlers : [handlers]
    await Promise.all(handlersAsArr.map(handler => {
      const actualHandler = typeof handler === 'string'
        ? getRegisteredHandler(handler)
        : handler
      if (actualHandler === undefined) return;
      return actualHandler(payload, {
        ...details,
        globals: { ...Globals.globalObj }
      })
    }))
  }

  export function getRegisteredHandler (name: string) {
    const found = registeredHandlers.get(name) as HandlerFunc | undefined
    return found
  }
}
