import { render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import AudioQuote, { Props } from '~/components/AudioQuote'
import { toBoolean, toNumber, toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function AudioQuoteApp({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <AudioQuote {...props} />
  render(app, root)
  silentLogger?.log(
    'audioquote-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps(options: Options): Props {
  const props: Props = {}
  const {
    audioSrc,
    subsSrc,
    subsGroups,
    autoPlayWhenVisible,
    autoPauseWhenHidden,
    autoLoudWhenVisible,
    autoMuteWhenHidden,
    title,
    playButton,
    pauseButton,
    loudButton,
    muteButton,
    hidePauseButton,
  } = options

  if (audioSrc !== undefined) { props.audioSrc = toString(audioSrc) }
  if (subsSrc !== undefined) { props.subsSrc = toString(subsSrc) }

  if (typeof subsGroups === 'string') {
    props.subsGroups = subsGroups
      .split(',')
      .map(str => toNumber(str.trim()))
  }
  if (Array.isArray(subsGroups)) { props.subsGroups = subsGroups.map(value => toNumber(value)) }

  if (autoPlayWhenVisible !== undefined) { props.autoPlayWhenVisible = toBoolean(autoPlayWhenVisible) }
  if (autoPauseWhenHidden !== undefined) { props.autoPauseWhenHidden = toBoolean(autoPauseWhenHidden) }
  if (autoLoudWhenVisible !== undefined) { props.autoLoudWhenVisible = toBoolean(autoLoudWhenVisible) }
  if (autoMuteWhenHidden !== undefined) { props.autoMuteWhenHidden = toBoolean(autoMuteWhenHidden) }

  if (title !== undefined) props.title = toVNode(title)
  if (playButton !== undefined) props.playButton = toVNode(playButton)
  if (pauseButton !== undefined) props.pauseButton = toVNode(pauseButton)
  if (loudButton !== undefined) props.loudButton = toVNode(loudButton)
  if (muteButton !== undefined) props.muteButton = toVNode(muteButton)

  if (hidePauseButton !== undefined) { props.hidePauseButton = toBoolean(hidePauseButton) }

  return props
}
