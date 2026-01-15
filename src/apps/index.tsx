import { Component, ComponentClass, FunctionComponent, VNode } from 'preact'
import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { isArrayOf } from '@design-edito/tools/agnostic/arrays/is-array-of'
import { randomUUID } from '@design-edito/tools/agnostic/random/uuid'
import {
  recordFormat,
  Format as FormatterFormat,
  Formatted as FormatterFormatted
} from '@design-edito/tools/agnostic/objects/record-format'
import { Events } from '~/shared/events'
import { Globals } from '~/shared/globals'
import { LmHtml } from '~/shared/lm-html'

export namespace Apps {
  export enum Name {
    _CAROUSEL = '_carousel',
    _SLIDESHOW = '_slideshow',
    AUDIOQUOTE = 'audioquote',
    DRAWER = 'drawer',
    EVENT_LISTENER = 'event-listener',
    GALLERY = 'gallery',
    HEADER = 'header',
    INTERSECTION_OBSERVER = 'intersection-observer',
    NAVIGATION = 'navigation',
    RESIZE_OBSERVER = 'resize-observer',
    SCRLLGNGN = 'scrllgngn',
    SVELTE_APP = 'svelte-app',
    TOP_ARTICLES = 'top-articles',
    UI = 'ui',
    VIDEO_PLAYER = 'video-player'
  }

  export const rendered: Array<{
    id: string | null
    name: string | null
    props: unknown
    app: App
  }> = []

  type RendererModuleResult<T extends Record<string, unknown> = {}> = { props: T, Component: ComponentClass | FunctionComponent }
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
      if (name === Name.EVENT_LISTENER) { loaded = (await import('~/apps/event-listener')).default }
      if (name === Name.GALLERY) { loaded = (await import('~/apps/gallery')).default }
      if (name === Name.HEADER) { loaded = (await import('~/apps/header')).default }
      if (name === Name.INTERSECTION_OBSERVER) { loaded = (await import('~/apps/intersection-observer')).default }
      if (name === Name.NAVIGATION) { loaded = (await import('~/apps/navigation')).default }
      if (name === Name.RESIZE_OBSERVER) { loaded = (await import('~/apps/resize-observer')).default }
      if (name === Name.SCRLLGNGN) { loaded = (await import('~/apps/scrllgngn')).default }
      if (name === Name.SVELTE_APP) { loaded = (await import('~/apps/svelte-app')).default }
      if (name === Name.TOP_ARTICLES) { loaded = (await import('~/apps/top-articles')).default }
      if (name === Name.UI) { loaded = (await import('~/apps/ui')).default }
      if (name === Name.VIDEO_PLAYER) { loaded = (await import('~/apps/video-player')).default }
      if (loaded === null) throw null
      return loaded
    } catch (err) {
      return undefined
    }
  }

  export type AppProps = {
    component: ComponentClass | FunctionComponent
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
      if (typeof propsSetter === 'function') this.setState(curr => propsSetter(curr))
      else this.setState(propsSetter)
    }

    render () {
      const { props, state } = this
      const customClass = typeof state.customClass === 'string' ? `${state.customClass} lm-app` : 'lm-app'
      const childProps = { ...this.state, customClass } as typeof state
      return <props.component {...childProps} />
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

  export function getAppByName (name: string) {
    const foundAppDetail = Apps.rendered.find(appDetails => appDetails.name === name)
    return foundAppDetail?.app;
  } 

  export function getAppById (id: string) {
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
    return Cast.toString(input)
  }

  export function ifNotUndefinedHelper<T extends any> (value: unknown, then: (value: unknown) => T) {
    if (value === undefined) return undefined
    return then(value)
  }

  export function ifArrayHelper<T extends any> (value: unknown, then: (value: unknown[]) => T) {
    if (Array.isArray(value)) return then(value)
    return undefined
  }

  export function toStringOrStringsHelper (value: unknown): string | string[] {
    if (Array.isArray(value)) return value.map(Cast.toString)
    return Cast.toString(value)
  }

  export function makeHandlerHelper<T> (type: Events.Type, input: unknown, id: string) {
    if (input === undefined) return;
    return Apps.ifNotUndefinedHelper(input, input => ((payload?: T) => {
      const handlersNames = Apps.toStringOrStringsHelper(input)
      return Events.sequentialHandlersCall(handlersNames, payload, { type, initiator: { id } })
    }))
  }

  type UnknownRecordFormatter = FormatterFormat<Record<string, unknown>>

  export async function toPropsHelper<F extends UnknownRecordFormatter = {}> (
    input: unknown,
    format: F
  ): Promise<FormatterFormatted<F> | undefined> {
    if (!isRecord(input)) return undefined
    const props = await recordFormat(input, format)
    return props
  }
}
