import { VNode } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  content?: string | VNode
  size?: 'large' | 'medium' | 'small'
  disabled?: boolean
  squared?: boolean
  secondary?: boolean
  icon?: VNode
}

export default function Button (props: Props) {
  const rootClass = 'lmui-button'
  const bemClss = bem(rootClass).mod({
    m: props.size === 'medium',
    s: props.size === 'small',
    squared: props.squared,
    secondary: props.secondary,
    'with-icon': props.icon !== undefined
  })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const iconWrapperClass = bem(rootClass).elt('icon')
  console.log(props.icon)
  return <button
    class={wrapperClasses.join(' ')}
    disabled={props.disabled}>
    {props.content}
    {props.icon !== undefined && <div className={iconWrapperClass.value}>
      {props.icon}
    </div>}
  </button>
}
