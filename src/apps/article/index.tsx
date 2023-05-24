import { render } from 'preact'
import Article, { Props as ArticleProps, ArticleElementProps } from '~/components/Article'
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
  // [WIP] do better here because we pass free data to components
  // and this could break. Nothing prevents from passing string[]
  // where string is expected, etc...
  try {
    const keys = Object.keys(unknown as any)
    const ret: Record<string, any> = {}
    keys.forEach(key => {
      const val = (unknown as any)[key]
      if (val instanceof HTMLElement) {
        ret[key] = nodesToVNodes([val])
      }
      else if (Array.isArray(val) && val.every(entry => entry instanceof HTMLElement)) {
        ret[key] = val.reduce((acc, curr) => {
          const vnodes = nodesToVNodes(curr)
          return [...acc, ...vnodes]
        }, [])
      }
      else if (
        (unknown as any)?.type === 'read-also'
        && key === 'subscribed') {
        ret[key] = toBoolean(val)
      }
      else ret[key] = val
    })
    return ret
  } catch (err) {
    return undefined
  }
}
