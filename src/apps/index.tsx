import { Component, ComponentClass, VNode } from 'preact'
import appConfig from '~/config'
import { Globals } from '~/shared/globals'
import { LmHtml } from '~/shared/lm-html'
import { toString } from '~/utils/cast'
import { injectStylesheet } from '~/utils/dynamic-css'
import isArrayOf from '~/utils/is-array-of'
import randomUUID from '~/utils/random-uuid'

export namespace Apps {
  export enum Name {
    _CAROUSEL = '_carousel',
    _SLIDESHOW = '_slideshow',
    AUDIOQUOTE = 'audioquote',
    DRAWER = 'drawer',
    GALLERY = 'gallery',
    HEADER = 'header',
    SCRLLGNGN = 'scrllgngn',
    UI = 'ui'
  }

  export async function toStringOrVNodeHelper (input: unknown): Promise<string | VNode> {
    if (input instanceof Node) return await LmHtml.render(input)
    if (isArrayOf<Node>(input, [Node]) || input instanceof NodeList) {
      const renderingNodes = [...input].map(node => LmHtml.render(node))
      const renderedNodes = await Promise.all(renderingNodes)
      return <>{renderedNodes}</>
    }
    return toString(input)
  }

  type RendererModuleResult<T extends Record<string, unknown> = {}> = { props: T, Component: ComponentClass }
  export type SyncRendererModule<T extends Record<string, unknown> = {}> = (unknownProps: unknown, id: string) => RendererModuleResult<T>
  export type AsyncRendererModule<T extends Record<string, unknown> = {}> = (unknownProps: unknown, id: string) => Promise<RendererModuleResult<T>>
  export type RendererModule<T extends Record<string, unknown> = {}> = SyncRendererModule<T> | AsyncRendererModule<T>

  export async function load (name: Name): Promise<RendererModule | undefined> {
    try {
      let loaded: RendererModule | null = null
      if (name === Name._CAROUSEL) { loaded = (await import('~/apps/_carousel')).default }
      if (name === Name._SLIDESHOW) { loaded = (await import('~/apps/_slideshow')).default }
      if (name === Name.AUDIOQUOTE) { loaded = (await import('~/apps/audioquote')).default }
      if (name === Name.DRAWER) { loaded = (await import('~/apps/drawer')).default }
      if (name === Name.GALLERY) { loaded = (await import('~/apps/gallery')).default }
      if (name === Name.HEADER) { loaded = (await import('~/apps/header')).default }
      if (name === Name.SCRLLGNGN) { loaded = (await import('~/apps/scrllgngn')).default }
      if (name === Name.UI) {
        const uiStyles = appConfig.paths.STYLES_UI_URL.toString()
        const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
        injectStylesheet(uiStyles, () => logger?.log('Styles', '%cStylesheet loaded', 'font-weight: 800;', uiStyles))
        loaded = (await import('~/apps/ui')).default
      }
      if (loaded === null) throw null
      return loaded
    } catch (err) {
      return undefined
    }
  }

  export const rendered: Array<{
    id: string | null
    name: string | null
    props: unknown
    app: App
  }> = []

  export type AppProps = {
    component: ComponentClass
    props: Record<string, unknown>
    identifier: string | null
    name: string | null
  }

  export type AppState = AppProps['props']

  export type AppObjPropsSetter = Partial<AppState>
  export type AppFuncPropsSetter = (curr: AppState) => AppState | null
  export type AppPropsSetter = AppObjPropsSetter | AppFuncPropsSetter

  export class App extends Component<AppProps, AppState> {
    identifier: string | null = null
    name: string | null = null
    constructor (props: AppProps) {
      super(props)
      this.state = props.props ?? {}
      this.identifier = props.identifier
      this.name = props.name
      this.updateProps = this.updateProps.bind(this)
      rendered.push({
        id: this.identifier,
        name: this.name,
        props,
        app: this
      })
    }

    updateProps (propsSetter: AppPropsSetter) {
      if (typeof propsSetter === 'function') {
        this.setState(propsSetter)
      } else {
        const newState: AppState = {
          ...this.state, 
          ...propsSetter
        }
        this.setState(() => ({ ...newState }))
      }
    }

    render () {
      const { props, state } = this
      const ChildComp = props.component
      const customClass = typeof state.customClass === 'string'
        ? `${state.customClass} lm-app`
        : 'lm-app'
      const childProps = { ...this.state, customClass } as typeof state
      return <ChildComp {...childProps} />
    }
  }

  export async function render (name: Name, _id: string | null, unknownProps: unknown): Promise<VNode> {
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    const appRenderer = await load(name)
    if (appRenderer === undefined) {
      logger?.error('Render', '%cRenderer load error', 'font-weight: 800;', `\nNo renderer found for app '${name}'. Props:`, unknownProps)
      return <></>
    }
    const privateId = randomUUID().split('-')[0] ?? ''
    const publicName = _id ?? randomUUID().split('-')[0] ?? null
    const { props, Component } = await appRenderer(unknownProps, privateId)
    const appComponent = <App
      component={Component}
      props={props}
      identifier={privateId}
      name={publicName} />
    logger?.log('Render', '%cRendered app', 'font-weight: 800', `'${name}', with public id '${publicName}' and props`, props)
    return appComponent
  }

  export function updatePropsOf (names: string[], updater: AppPropsSetter) {
    const foundAppsDetails = rendered.filter(appDetails => {
      const isInFilter = names.includes(appDetails.name as string)
      return isInFilter
    })
    const apps = foundAppsDetails.map(details => details.app)
    apps.forEach(app => app.updateProps(updater))
  }
}
