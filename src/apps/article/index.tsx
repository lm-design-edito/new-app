import { render } from 'preact'
import Article, { Props as ArticleProps, ArticleElementProps } from '~/components/Article'
import { Options, Renderer } from '~/shared/lm-page-apps'


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
  try {
    const keys = Object.keys(unknown as any)
    const ret: Record<string, any> = {}
    keys.forEach(key => {
      const val = (unknown as any)[key] // [WIP] probably convert HTML stuff here
      ret[key] = val
    })
    return ret
  } catch (err) {
    return undefined
  }
}
