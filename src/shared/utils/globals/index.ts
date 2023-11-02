import { init } from '~/shared'
import appConfig from '~/config'
import { Apps } from 'apps'
import { Analytics } from '~/shared/analytics'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import getHeaderElements from '~/shared/get-header-element'
import { LmHtml } from '~/shared/lm-html'
import Logger from '~/utils/silent-log'

type LmPage = {
  [Globals.GlobalKey.BUILD_TIME]?: string  // those are injected from /scripts/deploy
  [Globals.GlobalKey.ROOT_URL]?: string    // those are injected from /scripts/deploy
  [Globals.GlobalKey.TARGET]?: string      // those are injected from /scripts/deploy
  [Globals.GlobalKey.VERSION]?: string     // those are injected from /scripts/deploy
  [Globals.GlobalKey.ENV]?: string
  [Globals.GlobalKey.PATHS]?: typeof appConfig.paths
  [Globals.GlobalKey.ANALYTICS]?: typeof Analytics
  [Globals.GlobalKey.APPS]?: typeof Apps
  [Globals.GlobalKey.EVENTS]?: typeof Events
  [Globals.GlobalKey.GET_HEADER]?: typeof getHeaderElements
  [Globals.GlobalKey.LM_HTML]?: typeof LmHtml
  [Globals.GlobalKey.SILENT_LOGGER]?: Logger
  [Globals.GlobalKey.INIT]?: typeof init
  [Globals.GlobalKey.DATA_TREE]?: Darkdouille.Tree
}

declare global {
  interface Window {
    LM_PAGE?: LmPage
  }
}

export namespace Globals {
  export enum GlobalKey {
    BUILD_TIME = 'buildTime',
    ROOT_URL = 'rootUrl',
    TARGET = 'target',
    VERSION = 'version',
    ENV = 'env',
    PATHS = 'paths',
    ANALYTICS = 'Analytics',
    APPS = 'Apps',
    EVENTS = 'Events',
    GET_HEADER = 'getHeaderElements',
    LM_HTML = 'LmHtml',
    SILENT_LOGGER = 'silentLogger',
    INIT = 'init',
    DATA_TREE = 'dataTree'
  }
  
  function getOrCreateGlobalObj () {
    if (window.LM_PAGE !== undefined) return window.LM_PAGE
    const lmPage: LmPage = {}
    window.LM_PAGE = lmPage
    return lmPage
  }

  export function expose<T extends GlobalKey> (key: T, value: LmPage[T]): LmPage {
    const lmPage = getOrCreateGlobalObj()
    lmPage[key] = value
    return lmPage
  }

  export function retrieve<T extends GlobalKey> (key: T): LmPage[T] {
    const lmPage = getOrCreateGlobalObj()
    const returned = lmPage[key]
    return returned
  }

  export const globalObj = getOrCreateGlobalObj()
}
