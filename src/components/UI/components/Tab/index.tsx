import { VNode, Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

export type Props = {
  customClass?: string
  active?: boolean
  content?: string | VNode
  iconContent?: VNode | string
  iconFirst?: boolean
  onClick?: (event: MouseEvent) => void
}

export default class Tab extends Component<Props> {
  render () {
    const { props } = this
    const rootClass = 'lmui-tab'
    const bemClss = Bem.bem(rootClass).mod({
      active: props.active,
      'icon-first': props.iconFirst === true
    })
    const wrapperClasses = [bemClss.value]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    const iconClss = Bem.bem(rootClass).elt('icon')
    return <button
      className={wrapperClasses.join(' ')}
      onClick={props.onClick}>
      {props.content}
      {props.children}
      {props.iconContent !== undefined && <div className={iconClss.value}>
        {props.iconContent}
      </div>}
    </button>
  }
}
