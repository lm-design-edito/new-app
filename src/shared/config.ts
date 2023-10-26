// ENV
const env = process.env.NODE_ENV === 'production' ? 'production' : 'developpment'
const port = process.env.PORT ?? '3000'

// PATHS
const ROOT_URL = new URL(env === 'production' ? (window.LM_PAGE?.rootUrl ?? '') : `http://localhost:${port}`)
const SHARED_URL = new URL(`${ROOT_URL.href.replace(/\/$/, '')}/shared`)                 // shared/
const SCRIPTS_INDEX_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/index.js`)
const STYLES_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/styles`)               // shared/styles/
const STYLES_INDEX_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/index.css`)      // shared/styles/index.css
const STYLES_DEV_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/developpment.css`) // shared/styles/developpment.css
const STYLES_ARTICLE_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/article.css`)  // shared/styles/article.css

// Exports
export default {
  env,
  paths: {
    ROOT_URL,
    SHARED_URL,
    SCRIPTS_INDEX_URL,
    STYLES_URL,
    STYLES_INDEX_URL,
    STYLES_DEV_URL,
    STYLES_ARTICLE_URL
  },
  dataSourceSelector: 'data.lm-data-source',
  dataSourcesReservedNames: {
    slots: 'SLOTS',
    config: 'CONFIG'
  }
}
