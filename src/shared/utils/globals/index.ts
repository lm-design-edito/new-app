import { init } from '~/shared'
import appConfig from '~/config'
import { Apps } from 'apps'
import { Analytics } from '~/shared/analytics'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import { LmHtml } from '~/shared/lm-html'
import Logger from '~/utils/silent-log'
import isInEnum from '~/utils/is-in-enum'

type LmPage = {
  [Globals.GlobalKey.ANALYTICS]?: typeof Analytics
  [Globals.GlobalKey.APPS]?: typeof Apps
  [Globals.GlobalKey.DARKDOUILLE]?: typeof Darkdouille
  [Globals.GlobalKey.EVENTS]?: typeof Events
  [Globals.GlobalKey.LM_HTML]?: typeof LmHtml
  [Globals.GlobalKey.INIT]?: typeof init
  [Globals.GlobalKey.LOGGER]?: Logger
  [Globals.GlobalKey.META]?: {
    buildTime?: string // injected from /scripts/deploy
    rootUrl?: string   // injected from /scripts/deploy
    target?: string    // injected from /scripts/deploy
    version?: string   // injected from /scripts/deploy
    env?: string,
    paths?: typeof appConfig.paths
  }
  [Globals.GlobalKey.TREE]?: Darkdouille.Tree
  [Globals.GlobalKey.UTILS]?: Record<string, any>
}

declare global {
  interface Window {
    LM_PAGE?: LmPage
  }
}

export namespace Globals {
  export enum GlobalKey {
    ANALYTICS = 'Analytics',
    APPS = 'Apps',
    DARKDOUILLE = 'Darkdouille',
    EVENTS = 'Events',
    LM_HTML = 'LmHtml',
    INIT = 'init',
    LOGGER = 'logger',
    META = 'meta',
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
