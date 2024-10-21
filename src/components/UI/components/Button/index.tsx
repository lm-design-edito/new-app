import { VNode, FunctionalComponent } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

export type Props = {
  customClass?: string
  content?: string | VNode
  size?: 'large' | 'medium' | 'small'
  disabled?: boolean
  squared?: boolean
  secondary?: boolean
  iconContent?: VNode | string
  iconFirst?: boolean
  onClick?: (e: MouseEvent) => void
}

const Button: FunctionalComponent<Props> = (props: Props) => {
  const rootClass = 'lmui-button'
  const bemClss = Bem.bem(rootClass).mod({
    m: props.size === 'medium',
    s: props.size === 'small',
    squared: props.squared,
    secondary: props.secondary,
    'with-icon': props.iconContent !== undefined,
    'icon-first': props.iconFirst === true
  })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const iconWrapperClass = Bem.bem(rootClass).elt('icon')
  return <button
    className={wrapperClasses.join(' ')}
    disabled={props.disabled}
    onClick={props.onClick}>
    {props.content}
    {props.iconContent !== undefined && <div className={iconWrapperClass.value}>
      {props.iconContent}
    </div>}
  </button>
}

export default Button
