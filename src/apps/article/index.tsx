import { isValidElement, render } from 'preact'
import Article, { Props as ArticleProps, ArticleElementProps } from '~/components/Article'
import { ElementType as BasicElementType } from '~/components/Article/BasicTextElement'
import { Options, Renderer } from '~/shared/lm-page-apps'
import { toBoolean } from '~/utils/cast'
import nodesToVNodes from '~/utils/nodes-to-vnodes'

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
  const { elements } = options
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
    subscribed,
    label
  } = object
  const basicElementTypes = Object.values(BasicElementType)
  const typeIsElementType = basicElementTypes.includes(type as BasicElementType)
  if (type === undefined || typeIsElementType) {
    const elementProps: ArticleElementProps = { type: type as BasicElementType }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof content === 'string') elementProps.content = content
    else if (content instanceof HTMLElement) elementProps.content = nodesToVNodes(content)[0]
    else if (isValidElement(content)) elementProps.content = content
    if (typeof url === 'string') elementProps.url = url
    return elementProps
  }
  if (type === 'image') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof url === 'string') elementProps.url = url
    if (typeof alt === 'string') elementProps.alt = alt
    if (typeof credits === 'string') elementProps.credits = credits
    else if (credits instanceof HTMLElement) elementProps.credits = nodesToVNodes(credits)[0]
    else if (isValidElement(credits)) elementProps.credits = credits
    if (typeof description === 'string') elementProps.description = description
    else if (description instanceof HTMLElement) elementProps.description = nodesToVNodes(description)[0]
    else if (isValidElement(description)) elementProps.description = description
    if (captionPosition === 'overlay') elementProps.captionPosition = captionPosition
    else elementProps.captionPosition = 'below'
    return elementProps
  }
  if (type === 'read-also') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    elementProps.subscribed = toBoolean(subscribed)
    if (typeof url === 'string') elementProps.url = url
    if (typeof label === 'string') elementProps.label = label
    else if (label instanceof HTMLElement) elementProps.label = nodesToVNodes(label)[0]
    else if (isValidElement(label)) elementProps.label = label
    if (typeof content === 'string') elementProps.content = content
    else if (content instanceof HTMLElement) elementProps.content = nodesToVNodes(content)[0]
    else if (isValidElement(content)) elementProps.content = content
    return elementProps
  }
  if (type === 'read-in-english') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof url === 'string') elementProps.url = url
    if (typeof content === 'string') elementProps.content = content
    else if (content instanceof HTMLElement) elementProps.content = nodesToVNodes(content)[0]
    else if (isValidElement(content)) elementProps.content = content
    return elementProps
  }
  if (type === 'quote') { /* [WIP] */}
  if (type === 'share') { /* [WIP] */}
  if (type === 'html') {
    const elementProps: ArticleElementProps = { type }
    if (typeof customClass === 'string') elementProps.customClass = customClass
    if (typeof content === 'string') elementProps.content = content
    else if (content instanceof HTMLElement) elementProps.content = nodesToVNodes(content)[0]
    else if (isValidElement(content)) elementProps.content = content
    return elementProps
  }
}
