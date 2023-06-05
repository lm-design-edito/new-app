import { Component, JSX, VNode } from 'preact'
import Thumbnail from '~/components/Thumbnail'
import bem from '~/utils/bem'
import BasicTextElement, { ElementType } from '../BasicTextElement'
import Icon, { Icons } from '~/components/Icon'
import { toString } from '~/utils/cast'

const {
  MEDIA_CREDITS,
  MEDIA_DESCRIPTION
} = ElementType

export type Props = {
  customClass?: string
  url?: string
  alt?: string
  loading?: JSX.HTMLAttributes<HTMLImageElement>['loading']
  credits?: string | VNode
  description?: string | VNode
  captionPosition?: 'overlay' | 'below'
  toggleCaptionBtn?: boolean
  captionDefaultStatus?: 'open' | 'closed'
  openCaptionText?: string
  closeCaptionText?: string
  openCaptionIcon?: VNode
  closeCaptionIcon?: VNode
}

export default class Image extends Component<Props> {
  render() {
    const {
      customClass,
      url,
      alt,
      loading,
      credits,
      description,
      captionPosition,
      toggleCaptionBtn,
      captionDefaultStatus,
      openCaptionText,
      closeCaptionText,
      openCaptionIcon,
      closeCaptionIcon
    } = this.props
    const hasOverlayCaption = captionPosition === 'overlay'
    const hasToggleCaptionBtn = hasOverlayCaption && (toggleCaptionBtn === true)
    const clss = 'lm-article-image'
    const wrapperClass = bem(clss).mod({ 'caption-overlay': hasOverlayCaption })
    const captionClass = bem(clss).elt('caption')
    const caption = <div className={captionClass.value}>
      {description !== undefined && <BasicTextElement type={MEDIA_DESCRIPTION}>{description}</BasicTextElement>}
      {credits !== undefined && description !== undefined && <> </>}
      {credits !== undefined && <BasicTextElement type={MEDIA_CREDITS}>{credits}</BasicTextElement>}
    </div>
    return <div className={wrapperClass.value}>
      <Thumbnail
        customClass={customClass}
        imageUrl={url}
        imageAlt={alt ?? toString(description)}
        loading={loading}
        textCenterBottom={hasOverlayCaption ? caption : undefined}
        textBelow={hasOverlayCaption ? undefined : caption}
        toggleCaptionBtn={hasToggleCaptionBtn}
        captionDefaultStatus={captionDefaultStatus}
        openCaptionText={openCaptionText ?? 'Voir plus'}
        closeCaptionText={closeCaptionText ?? 'Voir moins'}
        openCaptionIcon={openCaptionIcon ?? <Icon file={Icons.TOGGLE_OPEN} />}
        closeCaptionIcon={closeCaptionIcon ?? <Icon file={Icons.TOGGLE_CLOSE} />}
      />
    </div>
  }
}
