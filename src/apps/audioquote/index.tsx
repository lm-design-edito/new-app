import { Apps } from '~/apps'
import Logger from '~/utils/silent-log'
import { toString, toNumber, toBoolean } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import AudioQuote, { Props } from '~/components/AudioQuote'

export default async function renderer (
  unknownProps: unknown,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, logger)
  const component = <AudioQuote {...props} />
  return { props, component }
}

async function toProps (input: unknown, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = {}
  const {
    customClass,
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
    hidePauseButton
  } = input
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (audioSrc !== undefined) { props.audioSrc = toString(audioSrc) }
  if (subsSrc !== undefined) { props.subsSrc = toString(subsSrc) }
  if (Array.isArray(subsGroups)) { props.subsGroups = subsGroups.map(item => toNumber(item)) }
  if (autoPlayWhenVisible !== undefined) { props.autoPlayWhenVisible = toBoolean(autoPlayWhenVisible) }
  if (autoPauseWhenHidden !== undefined) { props.autoPauseWhenHidden = toBoolean(autoPauseWhenHidden) }
  if (autoLoudWhenVisible !== undefined) { props.autoLoudWhenVisible = toBoolean(autoLoudWhenVisible) }
  if (autoMuteWhenHidden !== undefined) { props.autoMuteWhenHidden = toBoolean(autoMuteWhenHidden) }
  if (title !== undefined) { props.title = await Apps.toStringOrVNodeHelper(title, logger) }
  if (playButton !== undefined) { props.playButton = await Apps.toStringOrVNodeHelper(playButton, logger) }
  if (pauseButton !== undefined) { props.pauseButton = await Apps.toStringOrVNodeHelper(pauseButton, logger) }
  if (loudButton !== undefined) { props.loudButton = await Apps.toStringOrVNodeHelper(loudButton, logger) }
  if (muteButton !== undefined) { props.muteButton = await Apps.toStringOrVNodeHelper(muteButton, logger) }
  if (hidePauseButton !== undefined) { props.hidePauseButton = toBoolean(hidePauseButton) }
  return props
}
