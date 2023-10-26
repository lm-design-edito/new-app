// ENV
const env = process.env.NODE_ENV === 'production'
  ? 'production'
  : 'developpment'

// PATHS
const ROOT_URL = env === 'production'
  ? new URL(window.LM_PAGE?.rootUrl ?? '')
  : new URL('http://localhost:3000')
const SCRIPTS_INDEX_URL = new URL('shared/index.js', ROOT_URL)
const SHARED_URL = new URL('shared/', ROOT_URL)                // shared/
const STYLES_URL = new URL('styles/', SHARED_URL)              // shared/styles/
const STYLES_INDEX_URL = new URL('index.css', STYLES_URL)      // shared/styles/index.css
const STYLES_DEV_URL = new URL('developpment.css', STYLES_URL) // shared/styles/developpment.css
const STYLES_ARTICLE_URL = new URL('article.css', STYLES_URL)  // shared/styles/article.css

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
