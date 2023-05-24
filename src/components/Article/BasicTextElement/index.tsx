import { Component, VNode, JSX } from 'preact'
import Tag from '~/components/Tag'

export enum ElementType {
  EDITORIAL_NATURE = 'editorial-nature',
  HEADING = 'heading',
  INTERTITLE = 'intertitle',
  KICKER = 'kicker',
  MEDIA_DESCRIPTION = 'media-description',
  MEDIA_CREDITS = 'media-credits',
  PARAGRAPH = 'paragraph',
  PUBLICATION = 'publication',
  QUOTE = 'quote',
  SIGNATURE = 'signature',
  SUB_MARKER = 'sub-marker',
  TITLE = 'title',
}

function elementTypeToDefaultTag (elementType: ElementType): keyof JSX.IntrinsicElements {
  if (elementType === ElementType.EDITORIAL_NATURE) return 'span'
  if (elementType === ElementType.HEADING) return 'span'
  if (elementType === ElementType.INTERTITLE) return 'h2'
  if (elementType === ElementType.KICKER) return 'p'
  if (elementType === ElementType.MEDIA_DESCRIPTION) return 'span'
  if (elementType === ElementType.MEDIA_CREDITS) return 'span'
  if (elementType === ElementType.PARAGRAPH) return 'p'
  if (elementType === ElementType.PUBLICATION) return 'span'
  if (elementType === ElementType.QUOTE) return 'figure'
  if (elementType === ElementType.SIGNATURE) return 'span'
  if (elementType === ElementType.SUB_MARKER) return 'p'
  if (elementType === ElementType.TITLE) return 'h1'
  return 'p'
}

export type Props = {
  type?: ElementType
  customClass?: string
}

export default class BasicTextElement extends Component<Props> {
  render () {
    const { PARAGRAPH, SUB_MARKER } = ElementType
    const { type = PARAGRAPH, children, customClass } = this.props
    const clsses = [`lm-article-${type}`]
    if (customClass !== undefined) clsses.push(customClass)
    const tag = elementTypeToDefaultTag(type)
    return <Tag
      name={tag}
      className={clsses.join(' ')}>
      {type === SUB_MARKER ? 'Article réservé aux abonnés' : children}
    </Tag>
  }
}
