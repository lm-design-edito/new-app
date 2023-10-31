import { Apps } from '~/apps'

export namespace Events {
  export enum Source {
    SCRLLGNGN_ON_PAGE_CHANGE = 'scrllgngn-on-page-change'
  }

  export enum Name {
    ALERT = 'alert'
  }

  type HandlerName = string
  type HandlerFunc = (details: any, source: Source, apps: typeof Apps.rendered) => any
  export const registeredHandlers = new Map<HandlerName, HandlerFunc>()
  export function registerHandler (name: HandlerName, handler: HandlerFunc) {
    registeredHandlers.set(name, handler)
  }

  export function getRegisteredHandler (name: string) {
    return registeredHandlers.get(name)
  }

  export function makeHandler (
    source: Source,
    action: Name,
    unknownPayload: unknown) {
    return () => {
      console.log('i handle stuff !!', { source, action, unknownPayload })
    }
  }
}

const mySuperHandler = (
  eventDetails: any,
  eventSource: Events.Source,
  renderedApps: typeof Apps.rendered
) => {
  console.log('I handle an event called', eventSource)
  console.log('event details are', eventDetails)
  console.log('rendered apps are', renderedApps)
}

Events.registerHandler('mySuperHandler', mySuperHandler)
