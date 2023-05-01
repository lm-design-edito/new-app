import Logger from '~/utils/silent-log'
import { Base } from '~/utils/txt-base'

export enum GlobalKey {
  SILENT_LOGGER = 'silentLogger',
  DATABASE = 'database'
}

type LmPage = {
  [GlobalKey.SILENT_LOGGER]?: Logger
  [GlobalKey.DATABASE]?: Base
}

declare global {
  interface Window {
    LM_PAGE?: LmPage
  }
}

function createLmPage () {
  if (window.LM_PAGE !== undefined) return window.LM_PAGE
  const lmPage: LmPage = {}
  window.LM_PAGE = lmPage
  return lmPage
}

export function expose (key: GlobalKey.SILENT_LOGGER, value: Logger): LmPage;
export function expose (key: GlobalKey.DATABASE, value: Base): LmPage;
export function expose (key: GlobalKey, value: any): LmPage {
  const { SILENT_LOGGER, DATABASE } = GlobalKey
  const lmPage = createLmPage()
  if (key === SILENT_LOGGER) { lmPage[SILENT_LOGGER] = value }
  if (key === DATABASE) { lmPage[DATABASE] = value }
  return lmPage
}
