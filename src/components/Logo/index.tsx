import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import Svg from '~/components/Svg'
import logoUrl from './logo.svg'
import styles from './styles.module.scss'

export interface Props {
  href?: string
}

export default class Logo extends Component<Props, {}> {
  static clss: string = 'lm-logo'
  clss = Logo.clss

  render() {
    const logoClasses = [Bem.bem(this.clss).value, styles['logo']]
    return <a
      href={this.props.href ?? 'https://lemonde.fr'}
      className={logoClasses.join(' ')}>
      <Svg src={logoUrl} />
    </a>
  }
}
