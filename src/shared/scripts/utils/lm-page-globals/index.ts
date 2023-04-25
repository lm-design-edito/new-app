import Logger from '~/utils/silent-log'

type LmPage = {
  silentLogger?: Logger
}

declare global {
  interface Window {
    LM_PAGE?: LmPage
  }
}

export function createSilentLogger () {
  const logger = new Logger()
  if (window.LM_PAGE === undefined) { window.LM_PAGE = {} }
  window.LM_PAGE.silentLogger = logger
  return logger
}
