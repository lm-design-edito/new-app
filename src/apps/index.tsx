import { Component, ComponentClass, VNode } from 'preact'
import appConfig from '~/config'
import { Darkdouille, Events } from '~/shared'
import { Globals } from '~/shared/globals'
import { LmHtml } from '~/shared/lm-html'
import { Slots } from '~/shared/slots'
import { toString } from '~/utils/cast'
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
    UI = 'ui',
    RESIZE_OBSERVER = 'resize-observer',
    INTERSECTION_OBSERVER = 'intersection-observer',
    EVENT_LISTENER = 'event-listener',
  }

  export const rendered: Array<{
    id: string | null
    name: string | null
    props: unknown
    app: App
  }> = []

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
      if (name === Name.RESIZE_OBSERVER) { loaded = (await import('~/apps/resize-observer')).default }
      if (name === Name.INTERSECTION_OBSERVER) { loaded = (await import('~/apps/intersection-observer')).default }
      if (name === Name.EVENT_LISTENER) { loaded = (await import('~/apps/event-listener')).default }
      if (name === Name.UI) {
        const uiStyles = appConfig.paths.STYLES_UI_URL.toString()
        Slots.injectStyles('url', uiStyles, { position: Slots.StylesPositions.APP })
        const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
        logger?.log('Styles', '%cStylesheet injected', 'font-weight: 800;', uiStyles)
        loaded = (await import('~/apps/ui')).default
      }
      if (loaded === null) throw null
      return loaded
    } catch (err) {
      return undefined
    }
  }

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
    }

    componentDidMount(): void {
      const app = this
      const { identifier: id, name, props } = app
      rendered.push({ id, name, props, app })
      Globals.dispatch(Globals.EventName.APP_MOUNTED, { id })
    }

    componentWillUnmount(): void {
      const id = this.identifier
      const posInRendered = rendered.findIndex(appData => appData.id === id)
      if (posInRendered > -1) rendered.splice(posInRendered, 1) 
    }

    updateProps (propsSetter: AppPropsSetter) {
      if (typeof propsSetter === 'function') this.setState(propsSetter)
      else this.setState(() => ({ ...this.state,  ...propsSetter }))
    }

    render () {
      const { props, state } = this
      const ChildComp = props.component
      const customClass = typeof state.customClass === 'string' ? `${state.customClass} lm-app` : 'lm-app'
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

  export function updatePropsOf (apps: App[], updater: AppPropsSetter) {
    apps.forEach(app => app.updateProps(updater))
  }

  export function getAppByName(name: string) {
    const foundAppDetail = Apps.rendered.find(appDetails => appDetails.name === name)
    return foundAppDetail?.app;
  } 

  export function getAppById(id: string) {
    const foundAppDetail = Apps.rendered.find(appDetails => appDetails.id === id)
    return foundAppDetail?.app;
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

  export function eventsSyncHelper<T extends Events.Type> (options: {
    names: unknown
    appId: NonNullable<(typeof Apps.rendered)[number]['id']>
    eventType: T,
    syncProp: string
  }) {
    let names: string[]
    if (options.names === undefined) names = []
    else if (Array.isArray(options.names)) names = options.names.map(unknownName => toString(unknownName))
    else names = [toString(options.names)]

    // Here, some logic to listen the updates from loaded handlers, and update props of app

    const foundHandlers = names
      .map(name => Events.otherGetRegisteredHandler(name))
      .filter((found): found is Events.OtherHandlerFunc<Events.Type> => typeof found === 'function')
    return (payload: Events.Payloads[T]) => {
      Events.otherSequentialHandlersCall(foundHandlers, payload, {
        initiator: { id: options.appId },
        type: options.eventType
      })
    }
  }
}
