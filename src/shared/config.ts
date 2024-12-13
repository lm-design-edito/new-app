// ENVIRONMENT VARIABLES
const env = process.env.NODE_ENV === 'production' ? 'production' : 'developpment' as 'production' | 'developpment'
const port = process.env.PORT ?? '3000'
const builtOn = process.env.BUILT_ON ?? ''
const builtOnReadable = process.env.BUILT_ON_READABLE ?? ''
const version = process.env.VERSION ?? ''
const rootUrl = process.env.ROOT ?? `http://localhost:${port}`
const deployedOn = process.env.DEPLOYED_ON ?? ''
const deployedOnReadable = process.env.DEPLOYED_ON_READABLE ?? ''

// PATHS
const ROOT_URL = new URL(env === 'production' ? rootUrl : `http://localhost:${port}`)
const SHARED_URL = new URL(`${ROOT_URL.href.replace(/\/$/, '')}/shared`)                                // shared/
const SCRIPTS_INDEX_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/index.js`)                     // shared/index.js
const SHARED_ASSETS_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/assets`)                       // shared/assets/
const SHARED_ASSETS_ICONS_URL = new URL(`${SHARED_ASSETS_URL.href.replace(/\/$/, '')}/ui-icons`)        // shared/assets/ui-icons/
const STYLES_URL = new URL(`${SHARED_URL.href.replace(/\/$/, '')}/styles`)                              // shared/styles/
const STYLES_FONTS_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/fonts.css`)                     // shared/styles/fonts.css
const STYLES_INDEX_URL = new URL(`${STYLES_URL.href.replace(/\/$/, '')}/index.css`)                     // shared/styles/index.css

// SLOTS
const slotsHeadStylesElementClass = 'lm-slots-head-section'
const slotsRootElementClass = 'lm-slot'
const slotsShadowElementClass = 'lm-slot__shadow'
const slotsLightElementClass = 'lm-slot__light'
const slotsInnerElementClass = 'lm-slot__inner'
const slotsStylesElementClass = 'lm-slot__styles'
const slotsContentElementClass = 'lm-slot__content'

// THEME
const THEME_ICONS_DIR_REL_PATH = '/icons'
const THEME_ICONS_REGISTRY_REL_PATH = '/icons/registry.json'
const THEME_ICONS_ASSETS_DIR_PATH = '/icons/assets'

// DATA & HYPER-JSON
const dataSourceSelector = 'record.hyperjson'

// OTHER
const eventHandlersAllowedUrlSchemes: Array<Partial<URL>> = env === 'production' ? [
  { protocol: 'https:', hostname: 'assets-decodeurs.lemonde.fr' }
] : [
  { protocol: 'http:', hostname: 'localhost' },
  { protocol: 'https:', hostname: 'localhost' },
  { protocol: 'http:', hostname: '127.0.0.1' },
  { protocol: 'https:', hostname: '127.0.0.1' },
  { protocol: 'https:', hostname: 'assets-decodeurs.lemonde.fr' }
]

// Exports
export default {
  env,
  port,
  builtOn,
  builtOnReadable,
  version,
  deployedOn,
  deployedOnReadable,
  paths: {
    ROOT_URL,
    SHARED_URL,
    SCRIPTS_INDEX_URL,
    SHARED_ASSETS_URL,
    SHARED_ASSETS_ICONS_URL,
    STYLES_FONTS_URL,
    STYLES_INDEX_URL
  },
  theme: {
    THEME_ICONS_DIR_REL_PATH,
    THEME_ICONS_REGISTRY_REL_PATH,
    THEME_ICONS_ASSETS_DIR_PATH
  },
  slots: {
    headStylesElementClass: slotsHeadStylesElementClass,
    rootElementClass: slotsRootElementClass,
    shadowElementClass: slotsShadowElementClass,
    lightElementClass: slotsLightElementClass,
    innerElementClass: slotsInnerElementClass,
    styleElementClass: slotsStylesElementClass,
    contentElementClass: slotsContentElementClass
  },
  dataSourceSelector,
  dataSourcesReservedNames: {
    slots: 'SLOTS',
    config: 'CONFIG'
  },
  eventHandlersAllowedUrlSchemes
}
