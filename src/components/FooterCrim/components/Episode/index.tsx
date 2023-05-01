import { Component, VNode } from 'preact'
import styles from './styles.module.scss'

/* [WIP] camelCase ? */
export type EpisodeData = {
  text_top?: VNode | string
  text_bottom?: VNode | string
  text_card?: VNode | string
  url?: string
  cover?: string
  published?: boolean
}

type Props = {
  episode?: EpisodeData
}

export default class Episode extends Component<Props> {
  render() {
    const { episode } = this.props
    // [WIP] use bem()
    const episodeClasses = ['lm-footer-crim__episode', styles['episode']]
    const episodeCardClasses = ['lm-footer-crim__episode_card', styles['episode_card']]
    const episodeCoverClasses = ['lm-footer-crim__episode_cover', styles['episode_cover']]
    const episodeTextTopClasses = ['lm-footer-crim__episode_text-top', styles['episode_text-top']]
    const episodeTextCardClasses = ['lm-footer-crim__episode_text-card', styles['episode_text-card']]
    const episodeTextBottomClasses = ['lm-footer-crim__episode_text-bottom', styles['episode_text-bottom']]
    if (episode?.published) {
      episodeClasses.push(styles['episode-published'])
      episodeClasses.push('lm-footer-crim__episode--published')
    }
    return <div className={episodeClasses.join(' ')}>
      {episode?.text_top && <p
        className={episodeTextTopClasses.join(' ')}>
        {episode?.text_top}
      </p>}
      <div className={episodeCardClasses.join(' ')}>
        <a href={episode?.url ?? ''}>
          <div className={episodeCoverClasses.join(' ')}>
            <img src={episode?.cover} alt="" />
          </div>
          {episode?.text_card && <p
            className={episodeTextCardClasses.join(' ')}>
            {episode?.text_card}
          </p>}
        </a>
      </div>
      {episode?.text_bottom && <p
        className={episodeTextBottomClasses.join(' ')}>
        {episode?.text_bottom}
      </p>}
    </div>
  }
}
