import { Component, JSX } from 'preact'
import MediaCaption from '~/components/MediaCaption'
import Svg from '~/components/Svg'
import IOComp from '~/components/IntersectionObserver'
import bem from '~/utils/bem'
import styles from './styles.module.scss'
import loudIconUrl from './assets/loud.svg'
import muteIconUrl from './assets/mute.svg'
import playIconUrl from './assets/play.svg'
import pauseIconUrl from './assets/pause.svg'

type Props = {
  source?: string
  sourceType?: string
  posterUrl?: string
  title?: string
  kicker?: string
  description?: string
  credits?: string
  alt?: string
  loop?: boolean
  autoplay?: boolean
  sound?: boolean
  soundControls?: boolean
  playControls?: boolean
  timeControls?: boolean
  preload?: boolean
  // [WIP] add the time display in mm:ss || -mm:ss ?
  // fullscreen_controls?: boolean
  disclaimer?: boolean
  disclaimerText?: string
  disclaimerButton?: string
  // [WIP] review this, maybe not the cleanest
  videoHeight?: string
}

type State = {
  isDisclosed: boolean
  isLoud: boolean
  isPlaying: boolean
  videoProgression: number|null
}

type DeadState = {
  hasManuallyToggledPlayback: boolean
  hasStartedPlayback: boolean
}

// [WIP] make a type guesser based on the ext

export default class Video extends Component<Props, State> {
  state: State = {
    isDisclosed: false,
    isLoud: this.props.sound === true ? true : false,
    isPlaying: false,
    videoProgression: null,
  }
  bemClss = bem('lm-video')
  $video: HTMLVideoElement|null = null
  $timeline: HTMLDivElement|null = null
  deadState: DeadState = {
    hasManuallyToggledPlayback: false,
    hasStartedPlayback: false
  }

  constructor (props: Props) {
    super(props)
    this.toggleDisclose = this.toggleDisclose.bind(this)
    this.toggleSound = this.toggleSound.bind(this)
    this.isVideoPlaying = this.isVideoPlaying.bind(this)
    this.attemptTogglePlayback = this.attemptTogglePlayback.bind(this)
    this.attemptStartPlayback = this.attemptStartPlayback.bind(this)
    this.stopPlayback = this.stopPlayback.bind(this)
    this.updateTimeControlsBar = this.updateTimeControlsBar.bind(this)
    this.handlePlayControlsClick = this.handlePlayControlsClick.bind(this)
    this.handleTimeControlsBarClick = this.handleTimeControlsBarClick.bind(this)
    this.handleVideoClick = this.handleVideoClick.bind(this)
    this.handleVideoIntersectionEvent = this.handleVideoIntersectionEvent.bind(this)
  }

  componentDidMount(): void {
    const { $video, updateTimeControlsBar } = this
    updateTimeControlsBar()
    if ($video === null) return;
    $video.addEventListener('timeupdate', updateTimeControlsBar)
  }

  componentWillUnmount(): void {
    const { $video, updateTimeControlsBar } = this
    if ($video === null) return;
    $video.removeEventListener('timeupdate', updateTimeControlsBar)
  }

  toggleDisclose () {
    this.setState(curr => ({
      ...curr,
      isDisclosed: !curr.isDisclosed
    }))
  }

  toggleSound () {
    this.setState(curr => ({
      ...curr,
      isLoud: !curr.isLoud
    }))
  }

  isVideoPlaying () {
    const { $video } = this
    if ($video === null) return false
    if ($video.currentTime <= 0) return false
    if ($video.paused === true) return false
    if ($video.ended) return false
    if ($video.readyState <= 2) return false
    return true
  }

  async attemptTogglePlayback () {
    const {
      $video,
      isVideoPlaying,
      attemptStartPlayback,
      stopPlayback
    } = this
    if ($video === null) return;
    const isPlaying = isVideoPlaying()
    if (isPlaying) stopPlayback()
    else attemptStartPlayback()
  }

  async attemptStartPlayback () {
    const { deadState, $video, stopPlayback } = this
    if ($video === null) return;
    try {
      await $video.play()
      deadState.hasStartedPlayback = true
      this.setState({ isPlaying: true })
    } catch (err) {
      console.warn(err)
      stopPlayback()
    }
  }

  stopPlayback () {
    const { $video } = this
    if ($video === null) return;
    $video.pause()
    this.setState({ isPlaying: false })
  }

  updateTimeControlsBar () {
    const { $video } = this
    if ($video === null) return;
    const videoProgression = $video.currentTime / $video.duration
    this.setState(curr => {
      if (curr.videoProgression === videoProgression) return null
      return { ...curr, videoProgression }
    })
  }

  handleVideoClick () {
    const { props, attemptTogglePlayback } = this
    const { playControls } = props
    if (playControls !== true) return;
    this.deadState.hasManuallyToggledPlayback = true
    attemptTogglePlayback()
  }

  handlePlayControlsClick () {
    const { attemptTogglePlayback } = this
    this.deadState.hasManuallyToggledPlayback = true
    attemptTogglePlayback()
  }

  handleTimeControlsBarClick (event: JSX.TargetedMouseEvent<HTMLDivElement>) {
    const { $video, $timeline } = this
    if ($video === null) return
    if ($timeline === null) return
    const clickXPos = event.offsetX
    const timelineWidth = $timeline.clientWidth
    const targetRatio = clickXPos / timelineWidth
    const videoDuration = $video.duration
    const targetTimestamp = targetRatio * videoDuration
    $video.currentTime = targetTimestamp
  }

  handleVideoIntersectionEvent (entry: IntersectionObserverEntry) {
    const { props, deadState, attemptStartPlayback, stopPlayback } = this
    const { autoplay } = props
    if (autoplay !== true) return
    if (deadState.hasManuallyToggledPlayback === true) return
    const { isIntersecting } = entry
    if (isIntersecting) attemptStartPlayback()
    else stopPlayback()
  }

  render () {
    const {
      props,
      state,
      deadState,
      bemClss,
      toggleDisclose,
      toggleSound,
      handlePlayControlsClick,
      handleVideoClick,
      handleTimeControlsBarClick,
      handleVideoIntersectionEvent
    } = this

    // Logic
    const hasCaption = props.description !== undefined
      || props.credits !== undefined
    const hasTextoverlay = props.title !== undefined
      || props.kicker !== undefined
    const hasSoundControl = props.soundControls === true
    const isDisclosed = props.disclaimer !== true || state.isDisclosed
    const showFakePoster = props.autoplay === true
      && state.isPlaying === false
      && deadState.hasStartedPlayback === false
    const altTextArr: string[] = []
    if (props.alt) altTextArr.push(props.alt)
    else {
      if (props.kicker) altTextArr.push(props.kicker)
      if (props.description) altTextArr.push(props.description)
    }
    const altText = altTextArr.join('. ')

    // Classes
    const wrapperClasses = [bemClss.mod({
        playing: state.isPlaying,
        disclosed: state.isDisclosed,
        loud: state.isLoud,
        'fake-poster': showFakePoster
      }).value,
      styles['wrapper']
    ]
    if (state.isPlaying) wrapperClasses.push(styles['wrapper_playing'])
    if (showFakePoster) wrapperClasses.push(styles['wrapper_fake-poster'])
    const wrapperStyle = { '--video-height': props.videoHeight }
    const videoSlotClasses = [bemClss.elt('video-slot').value, styles['video-slot']]
    const videoClasses = [bemClss.elt('video').value, styles['video']]
    const fakePosterClasses = [bemClss.elt('fake-poster').value, styles['fake-poster']]
    const textOverlayClasses = [bemClss.elt('text-overlay').value, styles['text-overlay']]
    const titleClasses = [bemClss.elt('title').value, styles['title']]
    const kickerClasses = [bemClss.elt('kicker').value, styles['kicker']]
    const soundControlsClasses = [bemClss.elt('sound-controls').value, styles['sound-controls']]
    const soundControlSvgClasses = [bemClss.elt('sound-controls-svg'), styles['sound-controls-svg']]
    const controlsClasses = [bemClss.elt('controls').value, styles['controls']]
    const playControlsClasses = [bemClss.elt('play-controls').value, styles['play-controls']]
    const playControlsSvgClasses = [bemClss.elt('play-controls-svg').value, styles['play-controls-svg']]
    const timeControlsClasses = [bemClss.elt('time-controls').value, styles['time-controls']]
    const timeControlsBarClasses = [bemClss.elt('time-controls-bar').value, styles['time-controls-bar']]
    const disclaimerClasses = [bemClss.elt('disclaimer').value, styles['disclaimer']]
    const disclaimerTextClasses = [bemClss.elt('disclaimer-text').value, styles['disclaimer-text']]
    const disclaimerButtonClasses = [bemClss.elt('disclaimer-button').value, styles['disclaimer-button']]
    const captionClasses = [bemClss.elt('caption').value]
    return <div
      style={wrapperStyle}
      className={wrapperClasses.join(' ')}>
      <IOComp
        threshold={.6}
        callback={handleVideoIntersectionEvent}>
        <div className={videoSlotClasses.join(' ')}>
          {hasTextoverlay && <div className={textOverlayClasses.join(' ')}>
            <div className={titleClasses.join(' ')}>{props.title}</div>
            <div className={kickerClasses.join(' ')}>{props.kicker}</div>
          </div>}
          {hasSoundControl && <button
            className={soundControlsClasses.join(' ')}
            onClick={toggleSound}>
            <Svg
              className={soundControlSvgClasses.join(' ')}
              src={state.isLoud ? loudIconUrl : muteIconUrl} />
          </button>}
          <div className={controlsClasses.join(' ')}>
            {props.playControls && <button
              className={playControlsClasses.join(' ')}
              onClick={handlePlayControlsClick}>
              <Svg
                className={playControlsSvgClasses.join(' ')}
                src={state.isPlaying ? pauseIconUrl : playIconUrl} />
            </button>}
            {props.timeControls && <div
              onClick={handleTimeControlsBarClick}
              className={timeControlsClasses.join(' ')}
              ref={n => { this.$timeline = n }}>
              <div
                style={{ width: `${(state.videoProgression ?? 0) * 100}%` }}
                className={timeControlsBarClasses.join(' ')} />
            </div>}
          </div>
          {isDisclosed === false && <div className={disclaimerClasses.join(' ')}>
            <div className={disclaimerTextClasses.join(' ')}>
              {props.disclaimerText ?? 'Images violentes'}
            </div>
            <button 
              className={disclaimerButtonClasses.join(' ')}
              onClick={toggleDisclose}>
              {props.disclaimerButton ?? 'Voir'}
            </button>
          </div>}
          <video
            className={videoClasses.join(' ')}
            ref={n => { this.$video = n }}
            onClick={handleVideoClick}
            preload={props.preload === true ? 'auto' : 'none'}
            playsInline
            loop={props.loop}
            muted={props.sound !== true && state.isLoud !== true}
            poster={props.posterUrl}
            alt={altText}>
            <source
              src={props.source}
              type={props.sourceType} />
          </video>
          <img
            className={fakePosterClasses.join(' ')}
            src={props.posterUrl} alt={altText} />
        </div>
        {hasCaption && <div className={captionClasses.join(' ')}>
          <MediaCaption
            description={props.description}
            credits={props.credits} />
        </div>}
      </IOComp>
    </div>
  }
}
