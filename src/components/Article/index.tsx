import { Component, VNode } from 'preact'
import BasicTextElement, { ElementType } from './BasicTextElement'
import Image, { Props as ImageProps } from './Image'
import ReadAlso, { Props as ReadAlsoProps } from './ReadAlso'
import ReadInEnglish, { Props as ReadInEnglishProps } from './ReadInEnglish'

type BasicArticleElementProps = {
  type?: ElementType
  content?: string|VNode
}
type ImageElementProps = ImageProps & { type: 'image' }
type ReadAlsoElementProps = ReadAlsoProps & {
  type: 'read-also'
  content?: string|VNode
}
type ReadInEnglishElementProps = ReadInEnglishProps & {
  type: 'read-in-english'
}

export type ArticleElementProps = BasicArticleElementProps
  |ImageElementProps
  |ReadAlsoElementProps
  |ReadInEnglishElementProps

export type Props = {
  elements?: ArticleElementProps[]
}

export default class Article extends Component<Props> {
  render () {
    const { props } = this
    const { elements = [] } = props
    return <div className='lm-article'>
      {elements.map(elementData => {
        // Basic text elements
        if ([...Object.values(ElementType), undefined]
          .includes(elementData.type as any)) {
          const content = 'content' in elementData ? elementData.content : undefined
          return <BasicTextElement type={elementData.type as ElementType|undefined}>
            {content}
          </BasicTextElement>
        }
        // Image
        else if (elementData.type === 'image') {
          const {
            url,
            alt,
            credits,
            description,
            captionPosition
          } = elementData
          return <Image
            url={url}
            alt={alt}
            credits={credits}
            description={description}
            captionPosition={captionPosition} />
        }
        // ReadAlso
        else if (elementData.type === 'read-also') {
          const { url, content } = elementData
          return <ReadAlso url={url}>{content}</ReadAlso>
        }
        // ReadInEnglish
        else if (elementData.type === 'read-in-english') {
          const { url } = elementData
          return <ReadInEnglish url={url} />
        }
        // Partage
        // Unknown
        else return <></>
      })}
    </div>
  }
}











// enum SimpleArticleElement {
//   EDITORIAL_NATURE = 'editorial-nature',
//   HEADING = 'heading',
//   INTERTITLE = 'intertitle',
//   KICKER = 'kicker',
//   PARAGRAPH = 'paragraph',
//   PUBLICATION = 'publication',
//   QUOTE = 'quote',
//   SIGNATURE = 'signature',
//   SUB_MARKER = 'sub-marker',
//   TITLE = 'title',
// }

// type Props = {
//   elementName: SimpleArticleElement
//   tagName?: keyof JSX.IntrinsicElements
//   content?: string|HTMLElement|VNode
// }|{
//   elementName: 'read-in-english'
//   content?: string|HTMLElement|VNode
//   href?: string
// }|{
//   elementName: 'read-also'
//   content?: string|HTMLElement|VNode
//   subsOnly?: boolean
//   href?: string
// }|{
//   elementName: 'image'
//   imageUrl?: string
//   imageAlt?: string
//   legend?: string|HTMLElement|VNode
//   legendOverlay?: boolean
// }

// const getDefaultTagName = (elementName: SimpleArticleElement): keyof JSX.IntrinsicElements => {
//   if (elementName === SimpleArticleElement.EDITORIAL_NATURE) return 'span'
//   if (elementName === SimpleArticleElement.HEADING) return 'span'
//   if (elementName === SimpleArticleElement.KICKER) return 'p'
//   if (elementName === SimpleArticleElement.TITLE) return 'h1'
//   if (elementName === SimpleArticleElement.INTERTITLE) return 'h2'
//   if (elementName === SimpleArticleElement.SIGNATURE) return 'p'
//   if (elementName === SimpleArticleElement.PARAGRAPH) return 'p'
//   if (elementName === SimpleArticleElement.PUBLICATION) return 'p'
//   if (elementName === SimpleArticleElement.SUB_MARKER) return 'p'
//   if (elementName === SimpleArticleElement.QUOTE) return 'p'
//   return 'p'
// }

// class ArticleComponent extends Component<Props, {}> {

//   /* * * * * * * * * * * * * * * * * * *
//    * METHODS
//    * * * * * * * * * * * * * * * * * * */

//   /* [WIP] Logique à migrer plus haut */
//   toVNode (element?: string|HTMLElement|VNode): undefined|string|VNode {
//     if (element === undefined) return undefined
//     if (isValidElement(element)) return element
//     if (typeof element === 'string') return <StrToVNode content={element} />
//     return nodesToVNodes(element)[0]
//   }

//   /* * * * * * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * * * * * */
//   render (): JSX.Element {
//     const { props } = this
//     const clss = `lm-ui-${props.elementName}`
//     const { elementName } = props

//     /* Image */
//     if (elementName === 'image') {
//       let renderedLegend: undefined|string|VNode = this.toVNode(props.legend)
//       const legendProps = {} as Partial<ThumbnailProps>
//       if (props.legend && props.legendOverlay === true) legendProps.textInsideBottom = renderedLegend
//       else legendProps.textBelow = renderedLegend
//       return <Thumbnail
//         customClass={clss}
//         imageUrl={props.imageUrl}
//         imageAlt={props.imageAlt}
//         {...legendProps}
//       />
//     }

//     const { content } = props // All elements but image have a content prop

//     /* ReadAlso + ReadInEnglish */
//     if (elementName === 'read-also'
//       || elementName === 'read-in-english') {
//       let urlText = props.content
//       if (urlText === undefined && elementName === 'read-in-english') urlText = 'Read in English'

//       const premiumIconClass = 'lm-ui-premium-icon'

//       return (
//         <div className={clss}>
//           {elementName === 'read-also' && <span>Lire aussi</span>}
//           {elementName === 'read-also' && props.subsOnly === true
//             && <span className={premiumIconClass}></span>}
//           <a href={props.href}>{urlText}</a>
//         </div>
//       )
//     }

//     if (Object.values(SimpleArticleElement).includes(elementName) === false) {
//       console.error(`<Article>: '${elementName}' is not a valid elementName`)
//       return <></>
//     }

//     /* SimpleArticleElement */

//     const tagName = props.tagName ?? getDefaultTagName(elementName)
//     let renderedContent: undefined|string|VNode = undefined

//     if (elementName === SimpleArticleElement.SUB_MARKER) {
//       renderedContent = <><span></span>{this.toVNode(props.content) ?? 'Article réservé aux abonnés'}</>
//     } else {
//       renderedContent = this.toVNode(props.content)
//     }

//     return (
//       <Tag name={tagName} attributes={{ className: clss }}>
//         {renderedContent}
//         {props.children}
//       </Tag>
//     )
//   }
// }

// export type { Props }
// export default ArticleComponent
