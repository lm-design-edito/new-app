import { Component, VNode } from 'preact'
import StrToVNode from '../StrToVNodes'
import BasicTextElement, { ElementType } from './BasicTextElement'
import Image, { Props as ImageProps } from './Image'
import ReadAlso, { Props as ReadAlsoProps } from './ReadAlso'
import ReadInEnglish, { Props as ReadInEnglishProps } from './ReadInEnglish'
import SidePara, { Props as SideParaProps } from './SidePara'

type BasicArticleElementProps = {
  type?: ElementType
  content?: string|VNode
  url?: string
}
type ImageElementProps = ImageProps & { type: 'image' }
type ReadAlsoElementProps = ReadAlsoProps & {
  type: 'read-also'
  content?: string|VNode
  subscribed?: boolean
}
type ReadInEnglishElementProps = ReadInEnglishProps & {
  type: 'read-in-english'
  content?: string|VNode
}
type SideParaElementProps = SideParaProps & { 
  type: 'side-para' 
  content?: string|VNode
}
type HtmlElementProps = {
  type: 'html',
  content?: string|VNode
}

export type ArticleElementProps = { customClass?: string } & (BasicArticleElementProps
  |ImageElementProps
  |ReadAlsoElementProps
  |ReadInEnglishElementProps
  |SideParaElementProps
  |HtmlElementProps
  )

export type Props = {
  customClass?: string
  elements?: ArticleElementProps[]
}

export default class Article extends Component<Props> {
  render () {
    const { props } = this
    const { elements = [] } = props
    const wrapperClasses = ['lm-article']
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    return <div className={wrapperClasses.join(' ')}>
      {elements.map(elementData => {
        const { customClass } = elementData
        // Basic text elements
        if ([...Object.values(ElementType), undefined]
          .includes(elementData.type as any)) {
          const content = 'content' in elementData ? elementData.content : undefined
          const url = 'url' in elementData ? elementData.url : undefined
          return <BasicTextElement
            customClass={customClass}
            type={elementData.type as ElementType|undefined}
            url={url}>
            {content}
          </BasicTextElement>
        }
        // Image
        else if (elementData.type === 'image') {
          const {
            url,
            srcset,
            sizes,
            alt,
            credits,
            description,
            captionPosition,
            toggleCaptionBtn,
            captionDefaultStatus,
            openCaptionText,
            closeCaptionText,
            openCaptionIcon,
            closeCaptionIcon
          } = elementData
          return <Image
            customClass={customClass}
            url={url}
            srcset={srcset}
            sizes={sizes}
            alt={alt}
            credits={credits}
            description={description}
            captionPosition={captionPosition}
            toggleCaptionBtn={toggleCaptionBtn}
            captionDefaultStatus={captionDefaultStatus}
            openCaptionText={openCaptionText}
            closeCaptionText={closeCaptionText}
            openCaptionIcon={openCaptionIcon}
            closeCaptionIcon={closeCaptionIcon}
          />
        }
        // ReadAlso
        else if (elementData.type === 'read-also') {
          const { url, label, content, subscribed } = elementData
          return <ReadAlso
            customClass={customClass}
            url={url}
            label={label}
            subscribed={subscribed}>
            {content}
          </ReadAlso>
        }
        // ReadInEnglish
        else if (elementData.type === 'read-in-english') {
          const { url, content } = elementData
          return <ReadInEnglish
            customClass={customClass}
            url={url}>
            {content}
          </ReadInEnglish>
        } else if (elementData.type === 'side-para') {
          const { label, content } = elementData
          return <SidePara
            customClass={customClass}
            label={label}
            >
            {content}
          </SidePara>
        }
        // [WIP] Partage
        // [WIP] Quote
        
        // HTML
        else if (elementData.type === 'html') {
          const { content } = elementData
          if (content === undefined) return <></>
          if (typeof content === 'string') return <StrToVNode content={content} />
          return content
        }
        // Unknown
        else return <></>
      })}
    </div>
  }
}
