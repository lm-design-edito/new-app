import { Darkdouille } from '~/shared/darkdouille'
import Logger from '~/utils/silent-log'

type LmPage = {
  [Globals.GlobalKey.ENV]?: string         // those are injected from /scripts/deploy
  [Globals.GlobalKey.VERSION]?: string     // those are injected from /scripts/deploy
  [Globals.GlobalKey.TARGET]?: string      // those are injected from /scripts/deploy
  [Globals.GlobalKey.BUILD_TIME]?: string  // those are injected from /scripts/deploy
  [Globals.GlobalKey.ROOT_URL]?: string    // those are injected from /scripts/deploy
  [Globals.GlobalKey.SILENT_LOGGER]?: Logger
  [Globals.GlobalKey.DATA_TREE]?: Darkdouille.Tree
}

declare global {
  interface Window {
    LM_PAGE?: LmPage
  }
}

export namespace Globals {
  export enum GlobalKey {
    ENV = 'env',
    VERSION = 'version',
    TARGET = 'target',
    BUILD_TIME = 'buildTime',
    ROOT_URL = 'rootUrl',
    SILENT_LOGGER = 'silentLogger',
    DATA_TREE = 'dataTree'
  }
  
  function createGlobalObj () {
    if (window.LM_PAGE !== undefined) return window.LM_PAGE
    const lmPage: LmPage = {}
    window.LM_PAGE = lmPage
    return lmPage
  }

  export function expose<T extends GlobalKey> (key: T, value: LmPage[T]): LmPage {
    const lmPage = createGlobalObj()
    lmPage[key] = value
    return lmPage
  }

  export function retrieve<T extends GlobalKey> (key: T): LmPage[T] {
    const lmPage = createGlobalObj()
    const returned = lmPage[key]
    return returned
  }
}
