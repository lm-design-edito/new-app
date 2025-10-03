import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import appConfig from '~/config'
import { Globals } from '~/shared/globals'

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
    GALLERY_SLIDE_CHANGE = 'gallery-slide-change',
    GALLERY_PREV_CLICK = 'gallery-prev-click',
    GALLERY_NEXT_CLICK = 'gallery-next-click',
    GALLERY_DOT_CLICK = 'gallery-dot-click',
    /* Intersection Observer */
    INTERSECTION_OBSERVER_CALLBACK = 'intersection-observer-callback',
    /* Navigation */
    NAVIGATION_ITEM_CLICK = 'navigation-item-click',
    /* Resize Observer */
    RESIZE_OBSERVER_RESIZE = 'resize-observer-resize',
    /* Scrllgngn */
    SCRLLGNGN_PAGE_CHANGE = 'scrllgngn-page-change',
    SCRLLGNGN_SCROLL_TRACK = 'scrllgngn-scroll-track',
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
    let fileUrl: URL
    // [WIP] this try/catch in order to preserve the original behavior of v1.fuego
    // this should be removed at some point
    try {
      fileUrl = new URL(url)
    } catch (err) {
      fileUrl = new URL(url, window.location.href)
    }
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
    const moduleData = await import(fileUrl.toString())
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
    Globals.dispatch(Globals.EventName.HANDLER_FILE_LOADED, {
      url: fileUrl,
      handlers: handlerExportsMap
    })
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
    const globals = Globals.globalObj
    const logger = globals[Globals.GlobalKey.LOGGER]
    logger?.log(
      'Events',
      `%cDispatch`,
      'font-weight: 800;',
      `'${details.type}' from app with public id '${details.initiator.id}', and payload :`,
      payload)
    for (const handler of handlersAsArr) {
      const actualHandler = typeof handler === 'string'
        ? getRegisteredHandler(handler)
        : handler
      if (actualHandler === undefined) continue
      const output = await actualHandler(payload, { ...details, globals })
      logger?.log(
        'Events',
        `%cHandle`,
        'font-weight: 800;',
        `'${details.type}' with handler`,
        handler,
        `, arguments`,
        [payload, { ...details, globals }],
        `. Returned`,
        output)
    }
  }

  export async function parallelHandlersCall (
    handlers: HandlerFunc | string | Array<HandlerFunc | string>,
    payload: unknown,
    details: Omit<HandlerDetails, 'globals'>) {
    const handlersAsArr = Array.isArray(handlers) ? handlers : [handlers]
    const globals = Globals.globalObj
    const logger = globals[Globals.GlobalKey.LOGGER]
    logger?.log(
      'Events',
      `%cDispatch`,
      'font-weight: 800;',
      `'${details.type}' from app with public id '${details.initiator.id}', and payload :`,
      payload)
    await Promise.all(handlersAsArr.map(handler => {
      const actualHandler = typeof handler === 'string'
        ? getRegisteredHandler(handler)
        : handler
      if (actualHandler === undefined) return;
      const output = actualHandler(payload, { ...details, globals })
      logger?.log(
        'Events',
        `%cHandle`,
        'font-weight: 800;',
        `'${details.type}' with handler`,
        handler,
        `, arguments`,
        [payload, { ...details, globals }],
        `. Returned`,
        output)
      return output
    }))
  }

  export function getRegisteredHandler (name: string) {
    const found = registeredHandlers.get(name) as HandlerFunc | undefined
    return found
  }
}
