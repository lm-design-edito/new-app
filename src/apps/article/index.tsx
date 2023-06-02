import { isValidElement, render } from 'preact'
import Article, { Props as ArticleProps, ArticleElementProps } from '~/components/Article'
import { ElementType as BasicElementType } from '~/components/Article/BasicTextElement'
import { Options, Renderer } from '~/shared/lm-page-apps'
import { toBoolean, toString, toVNode } from '~/utils/cast'
import nodesToVNodes from '~/utils/nodes-to-vnodes'
import selectorToElement from '~/utils/selector-to-element'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function ArticleApp({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Article {...props} />
  render(app, root)
  silentLogger?.log(
    'article-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps(options: Options): ArticleProps {
  const props: ArticleProps = {}
  const { elements: _elements, customClass } = options
  if (customClass !== undefined) props.customClass = toString(customClass)
  const elements = Array.isArray(_elements) ? _elements : [_elements]
  if (Array.isArray(elements)) {
    props.elements = [];
    (elements as unknown[]).forEach(elementData => {
      const elementProps = unknownToElement(elementData)
      if (elementProps === undefined) return;
      props.elements?.push(elementProps)
    })
  }
  return props
}

function unknownToElement (unknown: unknown): ArticleElementProps|undefined {
  let isObject = false
  try {
    Object.keys(unknown as any)
    isObject = true
  } catch (err) {
    return undefined
  }
  if (!isObject) return;
  const object = unknown as Record<string, unknown>
  const {
    type,
    customClass,
    content,
    url,
    alt,
    credits,
    description,
    captionPosition,
    toggleCaptionBtn,
    captionDefaultStatus,
    openCaptionText,
    closeCaptionText,
    openCaptionIcon,
    closeCaptionIcon,
    subscribed,
    label
  } = object
  const basicElementTypes = Object.values(BasicElementType)
  const typeIsElementType = basicElementTypes.includes(type as BasicElementType)
  if (type === undefined || typeIsElementType) {
    const elementProps: ArticleElementProps = { type: type as BasicElementType }
    if (content !== undefined) { elementProps.content = toVNode(content) }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof url === 'string') elementProps.url = url
    return elementProps
  }
  if (type === 'image') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof url === 'string') elementProps.url = url
    if (typeof alt === 'string') elementProps.alt = alt
    if (credits !== undefined) { elementProps.credits = toVNode(credits) }
    if (description !== undefined) { elementProps.description = toVNode(description) }
    if (captionPosition === 'overlay') elementProps.captionPosition = captionPosition
    else elementProps.captionPosition = 'below'
    if (toggleCaptionBtn !== undefined) elementProps.toggleCaptionBtn = toBoolean(toggleCaptionBtn)
    if (captionDefaultStatus === 'open') elementProps.captionDefaultStatus = captionDefaultStatus
    else elementProps.captionDefaultStatus = 'closed'
    if (openCaptionText !== undefined) elementProps.openCaptionText = toString(openCaptionText)
    if (closeCaptionText !== undefined) elementProps.closeCaptionText = toString(closeCaptionText)
    if (openCaptionIcon !== undefined) elementProps.openCaptionIcon = toVNode(openCaptionIcon)
    if (closeCaptionIcon !== undefined) elementProps.closeCaptionIcon = toVNode(closeCaptionIcon)
    return elementProps
  }
  if (type === 'read-also') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    elementProps.subscribed = toBoolean(subscribed)
    if (typeof url === 'string') elementProps.url = url
    if (label !== undefined) { elementProps.label = toVNode(label) }
    if (content !== undefined) { elementProps.content = toVNode(content) }
    return elementProps
  }
  if (type === 'read-in-english') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof url === 'string') elementProps.url = url
    if (content !== undefined) { elementProps.content = toVNode(content) }
    return elementProps
  }
  if (type === 'quote') { /* [WIP] */}
  if (type === 'share') { /* [WIP] */}
  if (type === 'html') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (content !== undefined) { elementProps.content = toVNode(content) }
    return elementProps
  }
}
