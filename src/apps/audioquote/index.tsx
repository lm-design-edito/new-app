import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import { toString, toBoolean, toNumberArr } from '~/utils/cast'
import AudioQuote, { Props, State } from '~/components/AudioQuote'

export { Props, State }

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: AudioQuote }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    audioSrc: i => Apps.ifNotUndefinedHelper(i, toString),
    subsSrc: i => Apps.ifNotUndefinedHelper(i, toString),
    subsGroups: i => Apps.ifNotUndefinedHelper(i, toNumberArr),
    autoPlayWhenVisible: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    autoPauseWhenVisible: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    autoLoudWhenVisible: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    autoMuteWhenHidden: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    title: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    playButton: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    pauseButton: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    loudButton: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    muteButton: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    hidePauseButton: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    
    // Handlers
    onSubsLoad: i => Apps.makeHandlerHelper<string | undefined>(Events.Type.AUDIOQUOTE_SUBS_LOAD, i, id),
    onSubsError: i => Apps.makeHandlerHelper<Error | undefined>(Events.Type.AUDIOQUOTE_SUBS_ERROR, i, id),
    onAudioLoad: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_AUDIO_LOAD, i, id),
    onAudioError: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_AUDIO_ERROR, i, id),
    onTimeUpdate: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_TIME_UPDATE, i, id),
    onStart: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_START, i, id),
    onPlay: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_PLAY, i, id),
    onStop: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_STOP, i, id),
    onEnd: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_END, i, id),
    onPause: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_PAUSE, i, id),
    onLoud: i => Apps.makeHandlerHelper<undefined>(Events.Type.AUDIOQUOTE_LOUD, i, id),
    onMute: i => Apps.makeHandlerHelper<undefined>(Events.Type.AUDIOQUOTE_MUTE, i, id),
    onPlayClick: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_PLAY_CLICK, i, id),
    onPauseClick: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_PAUSE_CLICK, i, id),
    onLoudClick: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_LOUD_CLICK, i, id),
    onMuteClick: i => Apps.makeHandlerHelper<Event | undefined>(Events.Type.AUDIOQUOTE_MUTE_CLICK, i, id),
    onVisible: i => Apps.makeHandlerHelper<IntersectionObserverEntry | undefined>(Events.Type.AUDIOQUOTE_VISIBLE, i, id),
    onHidden: i => Apps.makeHandlerHelper<IntersectionObserverEntry | undefined>(Events.Type.AUDIOQUOTE_HIDDEN, i, id)
  }) ?? {}
}
