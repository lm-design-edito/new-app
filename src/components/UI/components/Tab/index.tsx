import { VNode } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  enabled?: boolean
  content?: string | VNode
  icon?: VNode
}

export default function Tab (props: Props) {
  const rootClass = 'lmui-tab'
  const bemClss = bem(rootClass).mod({ enabled: props.enabled })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const iconClss = bem(rootClass).elt('icon')
  return <button className={wrapperClasses.join(' ')}>
    {props.content}
    {props.icon !== undefined && <div class={iconClss.value}>
      {props.icon}
    </div>}
  </button>
}
