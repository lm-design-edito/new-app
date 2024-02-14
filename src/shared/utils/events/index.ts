import { Apps } from '~/apps'
import { Globals } from '~/shared/globals'

export namespace Events {
  export enum Type {
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
    RESIZE_OBSERVER_ON_RESIZE = 'resizeobserver-on-resize',
  }

  type HandlerName = string
  export type HandlerPayload = {
    details: any
    type: Type
    globals: typeof Globals.globalObj
    appId: string
    app: Apps.App | null
  }
  export type HandlerFunc = (payload: HandlerPayload) => any
  export const registeredHandlers = new Map<HandlerName, HandlerFunc>()
  export function registerHandler (name: HandlerName, handler: HandlerFunc) {
    registeredHandlers.set(name, handler)
  }

  export function getRegisteredHandler (name: string) {
    return registeredHandlers.get(name)
  }

  export async function syncCallHandlers (
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

  export async function asyncCallHandlers (
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
}
