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

export type Props = { type?: ElementType }

export default class BasicTextElement extends Component<Props> {
  render () {
    const { PARAGRAPH } = ElementType
    const { type = PARAGRAPH, children } = this.props
    const clss = `lm-article-${type}`
    const tag = elementTypeToDefaultTag(type)
    return <Tag
      name={tag}
      className={clss}>
      {children}
    </Tag>
  }
}
