import { render } from 'preact'
import { Options, Renderer } from 'shared/utils/lm-page-apps'

import flattenGetters from '~/utils/flatten-getters'

import ImageWithTextOverlay from '~/components/ImageWithTextOverlay'
import ArticleThumb from '~/components/ArticleThumb'

export enum ComponentsLib {
  ARTICLE_THUMB = 'ArticleThumb',
  IMAGE_WITH_TEXT_OVERLAY = 'ImageWithTextOverlay',
}

export const componentsMap = new Map<ComponentsLib, any>()
componentsMap.set(ComponentsLib.ARTICLE_THUMB, ArticleThumb)
componentsMap.set(ComponentsLib.IMAGE_WITH_TEXT_OVERLAY, ImageWithTextOverlay)

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

  const app = <ComponentToRender {...flattenGetters(componentProps)}></ComponentToRender>

  render(app, root)
  silentLogger?.log('anycomp-app/rendered', componentProps, root)
}
