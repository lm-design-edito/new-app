import { Component, JSX, VNode } from 'preact'

import bem from '~/utils/bem'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  isOpen?: boolean
  openText?: string
  closeText?: string
  openIcon?: VNode
  closeIcon?: VNode
  onClick?: () => void
}

export default class ToggleButton extends Component<Props, {}> {
  bemClss = bem('lm-toggle-button')

  /* * * * * * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * * * * * */
  render() {
    const { props, bemClss } = this

    const wrapperClasses = [
      bemClss.mod({ 'is-open': props.isOpen }).value,
      props.customClass,
      styles['wrapper']
    ]
    
    const text = props.isOpen ? props.closeText : props.openText
    const icon = props.isOpen ? props.closeIcon : props.openIcon

    return (
      <div className={wrapperClasses.join(' ')} onClick={props.onClick}>
        {text !== undefined && <span>{text}</span>}
        {icon !== undefined && icon}
      </div>
    )
  }
}
