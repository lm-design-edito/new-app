import { render } from 'preact'
import { Renderer } from 'shared/utils/lm-page-apps'
import flattenGetters from '~/utils/flatten-getters'
import Thumbnail from '~/components/Thumbnail'
import Article from '~/components/Article'
import ImageOverlay from '~/components/ImageOverlay'

export enum ComponentsLib {
  ARTICLE_THUMB = 'Thumbnail',
  ARTICLE_UI = 'Article',
  IMAGE_OVERLAY = 'ImageOverlay',
}

export const componentsMap = new Map<ComponentsLib, any>()
componentsMap.set(ComponentsLib.ARTICLE_THUMB, Thumbnail)
componentsMap.set(ComponentsLib.ARTICLE_UI, Article)
componentsMap.set(ComponentsLib.IMAGE_OVERLAY, ImageOverlay)

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default async function ComponentApp({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): Promise<ReturnType<Renderer>> {
  const { componentName, componentProps } = options as any
  const ComponentToRender = componentsMap.get(componentName as ComponentsLib)
  const app = <ComponentToRender {...flattenGetters(componentProps)} />
  render(app, root)
  silentLogger?.log('anycomp-for-dev-app/rendered', componentProps, root)
  silentLogger?.warn('anycomp-for-dev-app/rendered', 'This app only exists for dev purposes and is not part of the production bundle.')
}
