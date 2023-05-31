import { Component, VNode } from 'preact'
import Thumbnail from '~/components/Thumbnail'
import bem from '~/utils/bem'
import BasicTextElement, { ElementType } from '../BasicTextElement'

const {
  MEDIA_CREDITS,
  MEDIA_DESCRIPTION
} = ElementType

export type Props = {
  customClass?: string
  url?: string
  alt?: string
  credits?: string|VNode
  description?: string|VNode
  captionPosition?: 'overlay'|'below'
}

export default class Image extends Component<Props> {
  render () {
    const {
      customClass,
      url,
      alt,
      credits,
      description,
      captionPosition
    } = this.props
    const overlayCaption = captionPosition === 'overlay'
    const caption = <>
      {description !== undefined && <BasicTextElement type={MEDIA_DESCRIPTION}>{description}</BasicTextElement>}
      {credits !== undefined && description !== undefined && <> </>}
      {credits !== undefined && <BasicTextElement type={MEDIA_CREDITS}>{credits}</BasicTextElement>}
    </>
    const clss = bem('lm-article-image').mod({ 'caption-overlay': overlayCaption })
    return <div className={clss.value}>
      <Thumbnail
        customClass={customClass}
        imageUrl={url}
        imageAlt={alt}
        textCenterBottom={overlayCaption ? caption : undefined}
        textBelow={overlayCaption ? undefined : caption} />
    </div>
  }
}
