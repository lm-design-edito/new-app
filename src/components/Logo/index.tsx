import { Component } from 'preact'
import Svg from '~/components/Svg'
import bem from '~/utils/bem'
import logoUrl from './logo.svg'
import styles from './styles.module.scss'

export interface Props {}

export default class Logo extends Component<Props, {}> {
  static clss: string = 'lm-logo'
  clss = Logo.clss

  render() {
    const logoClasses = [bem(this.clss).value, styles['logo']]
    return <a
      href='https://lemonde.fr'
      className={logoClasses.join(' ')}>
      <Svg src={logoUrl} />
    </a>
  }
}
