export interface ConfigSpreadsheetUrls {
  production: string
  staging: string
  testing: string
  developpment: string
}

export interface ConfigLayoutNode {
  class: string
  type: 'cover'|'snippet'|'longform'
}

export interface ConfigLayout {
  name: string
  nodes: ConfigLayoutNode[]
}

export interface Config {
  assets_root_url: string
  spreadsheets_urls: ConfigSpreadsheetUrls
  layouts: ConfigLayout[]
  env: 'production'|'staging'|'testing'|'developpment'
}

export default function getConfig (): Config|undefined {
  const configElement = document.documentElement.querySelector('.lm-app-config')
  if (configElement === null) throw new Error('.lm-app-config is missing in page.')
  try {
    const config = JSON.parse(configElement.innerHTML) as Config
    return config
  } catch (error) {
    console.warn(error)
    console.log(configElement.innerHTML)
    return undefined
  }
}
