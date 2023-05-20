import { isValidElement, render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import AudioQuote, { Props } from '~/components/AudioQuote'
import { toBoolean, toNumber, toString } from '~/utils/cast'

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

  if (isValidElement(title)) props.title = title
  else if (title instanceof HTMLElement) props.title = title
  else if (title !== undefined) props.title = toString(title)

  if (isValidElement(playButton)) props.playButton = playButton
  else if (playButton instanceof HTMLElement) props.playButton = playButton
  else if (playButton !== undefined) props.playButton = toString(playButton)

  if (isValidElement(pauseButton)) props.pauseButton = pauseButton
  else if (pauseButton instanceof HTMLElement) props.pauseButton = pauseButton
  else if (pauseButton !== undefined) props.pauseButton = toString(pauseButton)

  if (isValidElement(loudButton)) props.loudButton = loudButton
  else if (loudButton instanceof HTMLElement) props.loudButton = loudButton
  else if (loudButton !== undefined) props.loudButton = toString(loudButton)

  if (isValidElement(muteButton)) props.muteButton = muteButton
  else if (muteButton instanceof HTMLElement) props.muteButton = muteButton
  else if (muteButton !== undefined) props.muteButton = toString(muteButton)

  if (hidePauseButton !== undefined) { props.hidePauseButton = toBoolean(hidePauseButton) }

  return props
}
