import { Component, VNode } from 'preact'
import Thumbnail from '~/components/Thumbnail'
import BasicTextElement, { ElementType } from '../BasicTextElement'

const {
  MEDIA_CREDITS,
  MEDIA_DESCRIPTION
} = ElementType

export type Props = {
  url?: string
  alt?: string
  credits?: string|VNode
  description?: string|VNode
  captionPosition?: 'overlay'|'below'
}

export default class Image extends Component<Props> {
  render () {
    const {
      url,
      alt,
      credits,
      description,
      captionPosition
    } = this.props
    const overlayLegend = captionPosition === 'overlay'
    const caption = <>
      {description !== undefined && <BasicTextElement type={MEDIA_DESCRIPTION}>{description}</BasicTextElement>}
      {credits !== undefined && description !== undefined && <> </>}
      {credits !== undefined && <BasicTextElement type={MEDIA_CREDITS}>{credits}</BasicTextElement>}
    </>
    return <div className='lm-article-image'>
      <Thumbnail
        imageUrl={url}
        imageAlt={alt}
        textInsideBottom={overlayLegend ? caption : undefined}
        textBelow={overlayLegend ? undefined : caption} />
    </div>
  }
}
