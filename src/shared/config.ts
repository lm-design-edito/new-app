// ENV
const env = process.env.NODE_ENV === 'production' ? 'production' : 'developpment'
const port = process.env.PORT ?? '3000'

// PATHS
const ROOT_URL = new URL(env === 'production' ? (window.LM_PAGE?.rootUrl ?? '') : `http://localhost:${port}`)
const SHARED_URL = new URL(`${ROOT_URL.href.replace(/\/$/, '')}/shared`)                                // shared/
const SCRIPTS_INDEX_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/index.js`)                     // shared/index.js
const SHARED_ASSETS_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/assets`)                       // shared/assets/
const SHARED_ASSETS_ICONS_URL = new URL(`${SHARED_ASSETS_URL.href.replace(/\/$/, '')}/ui-icons`)        // shared/assets/ui-icons/
const STYLES_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/styles`)                              // shared/styles/
const STYLES_INDEX_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/index.css`)                     // shared/styles/index.css
const STYLES_DEV_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/developpment.css`)                // shared/styles/developpment.css
const STYLES_ARTICLE_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/article.css`)                 // shared/styles/article.css
const STYLES_UI_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/ui.css`)                           // shared/styles/ui.css

// OTHER
const eventHandlersAllowedUrlSchemes: Array<Partial<URL>> = [
  { protocol: 'http:', hostname: 'localhost' },
  { protocol: 'https:', hostname: 'localhost' },
  { protocol: 'https:', hostname: 'assets-decodeurs.lemonde.fr' }
]

// Exports
export default {
  env,
  port,
  paths: {
    ROOT_URL,
    SHARED_URL,
    SCRIPTS_INDEX_URL,
    SHARED_ASSETS_URL,
    SHARED_ASSETS_ICONS_URL,
    STYLES_URL,
    STYLES_INDEX_URL,
    STYLES_DEV_URL,
    STYLES_ARTICLE_URL,
    STYLES_UI_URL
  },
  dataSourceSelector: 'data.dkdll',
  dataSourcesReservedNames: {
    slots: 'SLOTS',
    config: 'CONFIG'
  },
  eventHandlersAllowedUrlSchemes
}
