import { Component, VNode } from 'preact'
import * as Bem from '@design-edito/tools/agnostic/css/bem';
import Tab from '../UI/components/Tab'
import Gallery from '../Gallery'

export type Props = {
  customClass?: string
  activeItemId?: string | null
  items?: Array<{
    content: string | VNode,
    id: string,
    onClick?: (paylaod: {
      id: string,
      content: string | VNode,
      event: MouseEvent
    }) => void
  }>
  galleryScrollerWidth?: string
}

export default class Navigation extends Component<Props> {
  $galleryComp: Gallery | null = null

  componentDidUpdate(previousProps: Readonly<Props>): void {
    const { props, $galleryComp } = this
    if ($galleryComp === null) return;
    if (props.activeItemId === previousProps.activeItemId) return;
    const activeItemIdPos = props.items?.findIndex(itemData => itemData.id === props.activeItemId)
    if (activeItemIdPos === undefined) return;
    $galleryComp.setCurrentPage(activeItemIdPos)
  }

  render () {
    const { props } = this
    const activeId = props.activeItemId
    const wrapperBemClass = Bem.bem('lm-navigation')
    const wrapperClasses = [wrapperBemClass.value, props.customClass]
    return <div
      className={wrapperClasses.join(' ')}
      data-active-item-id={props.activeItemId}>
      <Gallery
        ref={(n: Gallery | null) => { this.$galleryComp = n }}
        customClass={wrapperBemClass.elt('gallery').value}
        scrollerWidth={props.galleryScrollerWidth ?? '100%'}
        snapScroll={true}
        itemsContent={props.items?.map(({ id, content, onClick }) => <Tab
          content={content}
          active={id === activeId}
          onClick={event => onClick?.({ id, content, event })} />)} />
    </div>
  }
}
