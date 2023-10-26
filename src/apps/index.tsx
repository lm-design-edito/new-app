import { VNode } from 'preact'
import { LmHtml } from '~/shared/lm-html'
import { toString } from '~/utils/cast'
import isArrayOf from '~/utils/is-array-of'
import Logger from '~/utils/silent-log'

export namespace Apps {
  export enum Name {
    AUDIOQUOTE = 'audioquote',
    HEADER = 'header',
    SCRLLGNGN = 'scrllgngn'
  }

  export async function toStringOrVNodeHelper (input: unknown, logger?: Logger): Promise<string | VNode> {
    if (input instanceof Node) return await LmHtml.render(input, logger)
    if (isArrayOf<Node>(input, [Node]) || input instanceof NodeList) {
      const renderingNodes = [...input].map(node => LmHtml.render(node, logger))
      const renderedNodes = await Promise.all(renderingNodes)
      return <>{renderedNodes}</>
    }
    return toString(input)
  }

  type RendererModuleResult<T extends unknown = unknown> = { props: T, component: VNode }
  export type SyncRendererModule<T extends unknown = unknown> = (unknownProps: unknown, logger?: Logger) => RendererModuleResult<T>
  export type AsyncRendererModule<T extends unknown = unknown> = (unknownProps: unknown, logger?: Logger) => Promise<RendererModuleResult<T>>
  export type RendererModule<T extends unknown = unknown> = SyncRendererModule<T> | AsyncRendererModule<T>

  export async function load (name: Name): Promise<RendererModule | undefined> {
    try {
      let loaded: RendererModule | null = null
      if (name === Name.AUDIOQUOTE) { loaded = (await import('~/apps/audioquote')).default }
      if (name === Name.HEADER) { loaded = (await import('~/apps/header')).default }
      if (name === Name.SCRLLGNGN) { loaded = (await import('~/apps/scrllgngn')).default }
      if (loaded === null) throw new Error('ERRR')
      return loaded
    } catch (err) {
      return undefined
    }
  }

  export async function render (
    name: Name,
    unknownProps: unknown,
    logger?: Logger): Promise<VNode> {
    const appRenderer = await load(name)
    if (appRenderer === undefined) {
      logger?.error('Render', '%cRenderer load error', 'font-weight: 800;', `\nNo renderer found for app '${name}'. Props:`, unknownProps)
      return <></>
    }
    const { props, component } = await appRenderer(unknownProps, logger)
    logger?.log('Render', '%cRendered app', 'font-weight: 800', `'${name}', with props`, props)
    return component
  }
}
