import { Component, JSX, VNode } from 'preact'
import Carousel from './components/Carousel'
import { EpisodeData } from './components/Episode'
import styles from './styles.module.scss'

// [WIP] this component is not supposed to be used in the long term
interface Props {
  generalData?: {
    header?: VNode|string
    styles?: string
  }
  episodesData?: EpisodeData[]
}

class FooterCrim extends Component<Props> {

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props } = this
    const { generalData, episodesData } = props
    const customCss = generalData?.styles?.trim()
      .replace(/\s+/igm, ' ')
      .replace(/\n/igm, ' ')
    // [WIP] use bem()
    const wrapperClasses = ['lm-footer-crim', styles['footer']]
    const headerClasses = ['lm-footer-crim__header', styles['header']]
    return <div className={wrapperClasses.join(' ')}>
      {/* [WIP] use dynamic-css module instead */}
      <style>{customCss}</style>
      <div className={headerClasses.join(' ')}>
        {generalData?.header}
      </div>
      <Carousel episodes={episodesData} />
    </div>
  }
}

export type { Props, FooterCrim }
export default FooterCrim
