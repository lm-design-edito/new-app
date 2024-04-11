import config from '~/config'


export namespace Theme {
  let _rootUrl: URL | null = null

  export function getRootUrl (): typeof _rootUrl {
    return _rootUrl
  }

  export function setRootUrl (url: URL | string | null): URL | null {
    if (url === null) {
      _rootUrl = null
      return null
    }
    const newUrl = new URL(url)
    _rootUrl = new URL(newUrl)
    return newUrl
  }

  export type IconData = {
    name: string
    url: URL
    description: string
    category: string
  }

  export const iconsRegistry = new Map<IconData['name'], Omit<IconData, 'name'>>()

  export function getIconUrlFromName (name: IconData['name']): URL | null {
    if (_rootUrl === null) return null
    const fileName = `${name}.svg`
    const iconsAssetsDirUrl = new URL(config.theme.THEME_ICONS_ASSETS_DIR_PATH, _rootUrl)
    return new URL(fileName, iconsAssetsDirUrl)
  }

  export function getIconData (name: IconData['name']): IconData | undefined {
    const found = iconsRegistry.get(name)
    if (found === undefined) return undefined
    return {
      name,
      ...found
    }
  }
}
