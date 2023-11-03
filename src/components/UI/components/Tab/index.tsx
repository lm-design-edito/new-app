import { VNode, FunctionalComponent } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  active?: boolean
  content?: string | VNode
  iconContent?: VNode | string
  iconFirst?: boolean
}

const Tab: FunctionalComponent<Props> = (props: Props) => {
  const rootClass = 'lmui-tab'
  const bemClss = bem(rootClass).mod({
    active: props.active,
    'icon-first': props.iconFirst === true
  })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const iconClss = bem(rootClass).elt('icon')
  return <button className={wrapperClasses.join(' ')}>
    {props.content}
    {props.iconContent !== undefined && <div class={iconClss.value}>
      {props.iconContent}
    </div>}
  </button>
}

export default Tab
