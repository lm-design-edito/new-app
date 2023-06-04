import { Component, JSX } from 'preact'
import Svg from '~/components/Svg'
import bem from '~/utils/bem'
import { injectCssRule } from '~/utils/dynamic-css'
import logoUrl from './logo.svg'
import styles from './styles.module.scss'

injectCssRule(`.${styles['logo']} .fill-1 {
  fill: var(--fill-1);
  transition: fill var(--fill-transition-time);
}`, 'lm-logo/fill-1')
injectCssRule(`.${styles['logo']} .fill-2 {
  fill: var(--fill-2);
  transition: fill var(--fill-transition-time);
}`, 'lm-logo/fill-2')

export interface Props {
  fill1?: string
  fill2?: string
  fillTransitionTime?: string
}

export default class Logo extends Component<Props, {}> {
  static clss: string = 'lm-logo'
  clss = Logo.clss

  render() {
    const { props } = this
    const logoClasses = [
      bem(this.clss).value,
      styles['logo']
    ]
    const logoStyle: JSX.CSSProperties = {
      '--fill-1': props.fill1 ?? '#FFFFFF',
      '--fill-2': props.fill2 ?? 'rgb(255, 255, 255, .6)',
      '--fill-transition-time': props.fillTransitionTime ?? '600ms'
    }
    return <a
      className={logoClasses.join(' ')}
      href='https://lemonde.fr'>
      <Svg src={logoUrl} style={logoStyle} />
    </a>
  }
}
