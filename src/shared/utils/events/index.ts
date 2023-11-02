import { Globals } from '~/shared/globals'

export namespace Events {
  export enum Type {
    SCRLLGNGN_ON_PAGE_CHANGE = 'scrllgngn-on-page-change'
  }

  type HandlerName = string
  type HandlerPayload = {
    details: any,
    type: Type,
    initiatorId: string,
    globals: typeof Globals.globalObj
  }
  type HandlerFunc = (payload: HandlerPayload) => any
  export const registeredHandlers = new Map<HandlerName, HandlerFunc>()
  export function registerHandler (name: HandlerName, handler: HandlerFunc) {
    registeredHandlers.set(name, handler)
  }

  export function getRegisteredHandler (name: string) {
    return registeredHandlers.get(name)
  }
}
