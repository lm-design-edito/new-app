import { init } from '~/shared'
import appConfig from '~/config'
import { Apps } from '~/apps'
import { Analytics } from '~/shared/analytics'
import { Config } from '~/shared/config'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import { Externals } from '~/shared/externals'
import { LmHtml } from '~/shared/lm-html'
import { Slots } from '~/shared/slots'
import Logger from '~/utils/silent-log'
import isInEnum from '~/utils/is-in-enum'

declare global {
  interface Window { LM_PAGE?: Globals.GlobalObj }
  interface WindowEventMap extends Globals.Events {}
}

export namespace Globals {
  export type GlobalObj = {
    [Globals.GlobalKey.HAS_AUTO_INITED]?: boolean
    [Globals.GlobalKey.ANALYTICS]?: typeof Analytics
    [Globals.GlobalKey.APPS]?: typeof Apps
    [Globals.GlobalKey.CONFIG]?: typeof Config
    [Globals.GlobalKey.DARKDOUILLE]?: typeof Darkdouille
    [Globals.GlobalKey.EVENTS]?: typeof Events
    [Globals.GlobalKey.EXTERNALS]?: typeof Externals
    [Globals.GlobalKey.INIT]?: typeof init
    [Globals.GlobalKey.LM_HTML]?: typeof LmHtml
    [Globals.GlobalKey.LOGGER]?: Logger
    [Globals.GlobalKey.META]?: {
      env?: string
      built_on?: string
      built_on_readable?: string
      version?: string
      deployed_on?: string
      deployed_on_readable?: string
      paths?: typeof appConfig.paths
    }
    [Globals.GlobalKey.SLOTS]?: typeof Slots
    [Globals.GlobalKey.TREE]?: Darkdouille.Tree
    [Globals.GlobalKey.UTILS]?: Record<string, any>
  }

  // Allowed keys in global obj
  export enum GlobalKey {
    HAS_AUTO_INITED = '_hasAutoInited',
    ANALYTICS = 'Analytics',
    APPS = 'Apps',
    CONFIG = 'Config',
    DARKDOUILLE = 'Darkdouille',
    EVENTS = 'Events',
    EXTERNALS = 'Externals',
    INIT = 'init',
    LM_HTML = 'LmHtml',
    LOGGER = 'logger',
    META = 'meta',
    SLOTS = 'Slots',
    TREE = 'tree',
    UTILS = 'utils',
  }
  
  // Global obj creation & access
  export function getOrCreateGlobalObj () {
    if (window.LM_PAGE !== undefined) return window.LM_PAGE
    const lmPage: GlobalObj = {}
    window.LM_PAGE = lmPage
    return lmPage
  }

  export const globalObj = getOrCreateGlobalObj()

  export function retrieve<T extends GlobalKey> (key: T): GlobalObj[T] {
    const lmPage = getOrCreateGlobalObj()
    const returned = lmPage[key]
    return returned
  }

  // Global obj mutation
  export function expose<T extends GlobalKey> (key: T, value: GlobalObj[T]): GlobalObj {
    const lmPage = getOrCreateGlobalObj()
    if (isInEnum(GlobalKey, key)) { lmPage[key as T] = value }
    return lmPage
  }

  // Global custom events
  export enum EventName {
    APP_MOUNTED = 'app-mounted',
    APP_UNMOUNTED = 'app-unmounted',
    HANDLER_FILE_LOADED = 'handler-file-loaded',
    HANDLER_REGISTERED = 'handler-registered'
  }

  export type EventsPayloads = {
    [EventName.APP_MOUNTED]: { id: (typeof Apps.rendered)[number]['id'] }
    [EventName.APP_UNMOUNTED]: { id: (typeof Apps.rendered)[number]['id'] }
    [EventName.HANDLER_FILE_LOADED]: { url: URL, handlers: Map<string, Events.HandlerFunc> }
    [EventName.HANDLER_REGISTERED]: { name: string, handler: Events.HandlerFunc }
  }

  export type Events = {
    [K in EventName]: CustomEvent<EventsPayloads[K]>
  }

  export function dispatch<T extends EventName> (
    name: T,
    payload: EventsPayloads[T]): Events[T] {
    const event = new CustomEvent(name, { detail: payload }) as Events[T]
    window.dispatchEvent(event)
    return event
  }

  export function addListener<T extends EventName> (
    name: T,
    listener: (event: Events[T]) => void
  ): void {
    window.addEventListener(name, listener)
  }

  export function removeListener<T extends EventName> (
    name: T,
    listener: (event: Events[T]) => void
  ): void {
    window.removeEventListener(name, listener)
  }
}
