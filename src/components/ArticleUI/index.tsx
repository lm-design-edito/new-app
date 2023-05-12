import { Component, VNode, JSX, isValidElement } from 'preact'

import ArticleThumb, { Props as ArticleThumbProps } from '~/components/ArticleThumb'
import StrToVNode from '~/components/StrToVNodes'
import Tag from '~/components/Tag'

import nodesToVNodes from '~/utils/nodes-to-vnodes'

enum SimpleArticleUI {
  EDITORIAL_NATURE = 'editorial-nature',
  HEADING = 'heading',
  KICKER = 'kicker',
  TITLE = 'title',
  INTERTITLE = 'intertitle',
  SIGNATURE = 'signature',
  PARAGRAPH = 'paragraph',
  PUBLICATION = 'publication',
  SUB_MARKER = 'sub-marker',
  QUOTE = 'quote',
}

type Props = {
  elementName: SimpleArticleUI
  tagName?: keyof JSX.IntrinsicElements
  content?: string | HTMLElement | VNode
} | {
  elementName: 'read-in-english'
  content?: string | HTMLElement | VNode
  href?: string
} | {
  elementName: 'read-also'
  content?: string | HTMLElement | VNode
  subsOnly?: boolean
  href?: string
} | {
  elementName: 'image'
  imageUrl?: string
  imageAlt?: string
  legend?: string | HTMLElement | VNode
  legendOverlay?: boolean
}

const getDefaultTagName = (elementName: SimpleArticleUI): keyof JSX.IntrinsicElements => {
  if (elementName === SimpleArticleUI.EDITORIAL_NATURE) return 'span'
  if (elementName === SimpleArticleUI.HEADING) return 'span'
  if (elementName === SimpleArticleUI.KICKER) return 'p'
  if (elementName === SimpleArticleUI.TITLE) return 'h1'
  if (elementName === SimpleArticleUI.INTERTITLE) return 'h2'
  if (elementName === SimpleArticleUI.SIGNATURE) return 'p'
  if (elementName === SimpleArticleUI.PARAGRAPH) return 'p'
  if (elementName === SimpleArticleUI.PUBLICATION) return 'p'
  if (elementName === SimpleArticleUI.SUB_MARKER) return 'p'
  if (elementName === SimpleArticleUI.QUOTE) return 'p'
  return 'p'
}

class ArticleUIComponent extends Component<Props, {}> {

  /* * * * * * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * * * * * */

  /* [WIP] Logique à migrer plus haut */
  toVNode(element?: string | HTMLElement | VNode): undefined | string | VNode {
    if (element === undefined) return undefined
    if (isValidElement(element)) return element
    if (typeof element === 'string') return <StrToVNode content={element} />
    return nodesToVNodes(element)[0]
  }

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props } = this
    const clss = `lm-ui lm-ui-${props.elementName}`

    /* Image */

    if (props.elementName === 'image') {
      let renderedLegend: undefined | string | VNode = this.toVNode(props.legend)
      const legendProps = {} as Partial<ArticleThumbProps>
      if (props.legend && props.legendOverlay === true) legendProps.textInsideBottom = renderedLegend
      else legendProps.textBelow = renderedLegend

      return (
        <ArticleThumb
          customClass={clss}
          imageUrl={props.imageUrl}
          imageAlt={props.imageAlt}
          {...legendProps}
        />
      )
    }

    /* ReadAlso + ReadInEnglish */

    if (props.elementName === 'read-also' || props.elementName === 'read-in-english') {
      let urlText = props.content
      if (urlText === undefined && props.elementName === 'read-in-english') urlText = 'Read in English'

      const premiumIconClass = 'lm-ui-premium-icon'

      return (
        <div className={clss}>
          {props.elementName === 'read-also' && <span>Lire aussi</span>}
          {props.elementName === 'read-also' && props.subsOnly === true
            && <span className={premiumIconClass}></span>}
          <a href={props.href}>{urlText}</a>
        </div>
      )
    }

    if (Object.values(SimpleArticleUI).includes(props.elementName) === false) {
      console.error(`<ArticleUI>: '${props.elementName}' is not a valid elementName`)
      return <></>
    }

    /* SimpleArticleUI */

    const tagName = props.tagName ?? getDefaultTagName(props.elementName)
    let renderedContent: undefined | string | VNode = undefined

    if (props.elementName === SimpleArticleUI.SUB_MARKER) {
      renderedContent = <><span></span>{this.toVNode(props.content) ?? 'Article réservé aux abonnés'}</>
    } else {
      renderedContent = this.toVNode(props.content)
    }

    return (
      <Tag name={tagName} attributes={{ className: clss }}>
        {renderedContent}
        {props.children}
      </Tag>
    )
  }
}

export type { Props }
export default ArticleUIComponent
