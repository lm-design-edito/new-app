import { init } from '~/shared'
import appConfig from '~/config'
import { Apps } from '~/apps'
import { Analytics } from '~/shared/analytics'
import { Config } from '~/shared/config'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import { LmHtml } from '~/shared/lm-html'
import { Slots } from '~/shared/slots'
import Logger from '~/utils/silent-log'
import isInEnum from '~/utils/is-in-enum'

export type LmPage = {
  [Globals.GlobalKey.ANALYTICS]?: typeof Analytics
  [Globals.GlobalKey.APPS]?: typeof Apps
  // [WIP] pourquoi ~/shared/config n'est pas exporté ?
  // ATTENTION, ~/shared/config === /src/shared/UTILS/config/index.ts,
  // pas /src/shared/config.ts, qui est un fichier de config privé du projet
  [Globals.GlobalKey.DARKDOUILLE]?: typeof Darkdouille
  [Globals.GlobalKey.EVENTS]?: typeof Events
  [Globals.GlobalKey.HAS_AUTO_INIT]?: boolean
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

type ProjectCustomEventsMap = Apps.Events & Config.Events

declare global {
  interface Window { LM_PAGE?: LmPage }
  interface WindowEventMap extends ProjectCustomEventsMap {}
}

export namespace Globals {
  export enum GlobalKey {
    ANALYTICS = 'Analytics',
    APPS = 'Apps',
    DARKDOUILLE = 'Darkdouille',
    EVENTS = 'Events',
    HAS_AUTO_INIT = 'hasAutoInit',
    INIT = 'init',
    LM_HTML = 'LmHtml',
    LOGGER = 'logger',
    META = 'meta',
    SLOTS = 'Slots',
    TREE = 'tree',
    UTILS = 'utils',
  }
  
  export function getOrCreateGlobalObj () {
    if (window.LM_PAGE !== undefined) return window.LM_PAGE
    const lmPage: LmPage = {}
    window.LM_PAGE = lmPage
    return lmPage
  }

  export function expose<T extends GlobalKey> (key: T, value: LmPage[T]): LmPage {
    const lmPage = getOrCreateGlobalObj()
    if (isInEnum(GlobalKey, key)) { lmPage[key as T] = value }
    return lmPage
  }

  export function retrieve<T extends GlobalKey> (key: T): LmPage[T] {
    const lmPage = getOrCreateGlobalObj()
    const returned = lmPage[key]
    return returned
  }

  export const globalObj = getOrCreateGlobalObj()
}
