import { Component, JSX, createRef, RefObject, VNode } from 'preact'
import IntersectionObserverComponent from '~/components/IntersectionObserver'
import bem from '~/utils/bem'
import styles from './styles.module.scss'

type SubGroupBoundaries = {
  startId: number
  endId: number
}

type SubData = {
  id: number
  start: number
  end: number
  content: string
}

type Props = {
  customClass?: string
  audioSrc?: string
  subsSrc?: string
  subsGroups?: number[]
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
  title?: string|VNode
  playButton?: string|VNode
  pauseButton?: string|VNode
  loudButton?: string|VNode
  muteButton?: string|VNode
  hidePauseButton?: boolean
}

type State = {
  timecodeInMs: number
  subsContent?: SubData[]
  isPlaying?: boolean
  isLoud?: boolean
  isEnded?: boolean
  hasEndedOnce?: boolean
  hasManuallyPaused?: boolean
  hasManuallyMuted?: boolean
}

class AudioQuote extends Component<Props, State> {
  bemClss = bem('lm-audio-quote')
  videoElt: RefObject<HTMLVideoElement> | null = null
  videoStateInterval?: number
  state: State = { timecodeInMs: 0 }

  /* * * * * * * * * * * * * * * * * * *
     * CONSTRUCTOR
     * * * * * * * * * * * * * * * * * * */
  constructor(props: Props) {
    super(props)
    this.videoElt = createRef()
    this.loadSubs = this.loadSubs.bind(this)
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
    this.handleVideoEnded = this.handleVideoEnded.bind(this)
    this.getDisplayedSubsContent = this.getDisplayedSubsContent.bind(this)
    this.timecodeToMs = this.timecodeToMs.bind(this)
    this.parseSubs = this.parseSubs.bind(this)
    this.tryStartPlayback = this.tryStartPlayback.bind(this)
    this.tryStopPlayback = this.tryStopPlayback.bind(this)
    this.trySetLoud = this.trySetLoud.bind(this)
    this.trySetMute = this.trySetMute.bind(this)
    this.isLoud = this.isLoud.bind(this)
    this.isPlaying = this.isPlaying.bind(this)
    this.syncVideoState = this.syncVideoState.bind(this)
    this.handlePlayClick = this.handlePlayClick.bind(this)
    this.handlePauseClick = this.handlePauseClick.bind(this)
    this.handleLoudClick = this.handleLoudClick.bind(this)
    this.handleMuteClick = this.handleMuteClick.bind(this)
    this.handleIntersection = this.handleIntersection.bind(this)
  }

  /* * * * * * * * * * * * * * * * * * *
     * METHODS
     * * * * * * * * * * * * * * * * * * */
  componentDidMount() {
    this.loadSubs()
    this.syncVideoState()
    this.videoStateInterval = window.setInterval(this.syncVideoState, 500)
    if (this.videoElt !== null && this.videoElt.current !== null) {
      this.videoElt.current.addEventListener('timeupdate', this.handleTimeUpdate)
      this.videoElt.current.addEventListener('ended', this.handleVideoEnded)
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.videoStateInterval)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.subsSrc !== this.props.subsSrc) {
      this.loadSubs()
    }
    if (this.videoElt !== null && this.videoElt.current !== null) {
      this.videoElt.current.addEventListener('timeupdate', this.handleTimeUpdate)
      this.videoElt.current.addEventListener('ended', this.handleVideoEnded)
    }
  }

  async loadSubs() {
    if (this.props.subsSrc === undefined) return
    try {
      const fetchResult = await fetch(this.props.subsSrc)
      const subsData = await fetchResult.text()
      if (typeof subsData === 'string') {
        this.setState({ subsContent: this.parseSubs(subsData) })
      }
    } catch (error) {
      // [WIP] silent log ?
      console.error(error)
    }
  }

  handleTimeUpdate() {
    if (this.videoElt === null || this.videoElt.current === null) return
    const currentTimeInMs = this.videoElt.current.currentTime * 1000
    this.setState({ timecodeInMs: currentTimeInMs })
  }

  handleVideoEnded() {
    this.syncVideoState()
  }

  timecodeToMs(timecode: string): number {
    const [hours, minutes, secondsAndMs] = timecode.split(':')
    const [seconds, milliseconds] = secondsAndMs.split(',')
    let result = parseInt(hours) * 60 * 60 * 1000
    result += parseInt(minutes) * 60 * 1000
    result += parseInt(seconds) * 1000
    result += parseInt(milliseconds)
    return result
  }

  parseSubs(rawSubs: string): SubData[] {
    const numberRegex = /^\d+$/
    const timecodeRegex = /^[0-9]+:[0-9]+:[0-9]+,[0-9]+\s*-->\s*[0-9]+:[0-9]+:[0-9]+,[0-9]+$/
    const parsedSubs: SubData[] = []
    rawSubs.split('\n').forEach(line => {
      if (line.trim() === '') return
      const lastAddedElement = parsedSubs[parsedSubs.length - 1] as SubData | undefined
      const looksLikeId = line.match(numberRegex)
      const looksLikeTimecode = line.match(timecodeRegex)

      // id
      if (looksLikeId) {
        if (lastAddedElement === undefined) { parsedSubs.push({ id: parseInt(line) } as SubData); return }
        if (lastAddedElement.content !== undefined) { parsedSubs.push({ id: parseInt(line) } as SubData); return }
      }

      // timecode
      if (looksLikeTimecode) {
        if (lastAddedElement !== undefined
          && lastAddedElement.id !== undefined) {
          const [rawStart, rawEnd] = line.split('-->')
          const startTime = rawStart.trim()
          const endTime = rawEnd.trim()
          lastAddedElement.start = this.timecodeToMs(startTime)
          lastAddedElement.end = this.timecodeToMs(endTime)
          return
        }
      }

      // content
      if (lastAddedElement !== undefined
        && lastAddedElement.id !== undefined
        && lastAddedElement.start != undefined
        && lastAddedElement.end != undefined) {
        if (lastAddedElement.content !== undefined) {
          lastAddedElement.content += line; return
        }
        lastAddedElement.content = line
      }
    })

    return parsedSubs
  }

  getDisplayedSubsContent() {
    const { state, props, bemClss } = this
    const { subsContent } = state
    if (subsContent === undefined) return
    const alreadyPronouncedSubs = subsContent.filter(({ start }) => start < state.timecodeInMs)
    const lastPronouncedSub = alreadyPronouncedSubs.at(-1) ?? null
    const highestSubId = Math.max(...subsContent.map(sub => sub.id))
    const subsGroupsWithBoundaries: SubGroupBoundaries[] = props.subsGroups?.reduce(
      (acc, curr, currIndex) => {
        const lastInAcc = acc.at(-1)
        const startId = lastInAcc === undefined ? 1 : lastInAcc.endId + 1
        const endId = curr
        if (currIndex === (props.subsGroups?.length ?? 0) - 1
          && endId !== highestSubId) {
          return [
            ...acc,
            { startId, endId },
            { startId: endId + 1, endId: highestSubId }
          ]
        }
        return [
          ...acc,
          { startId, endId }
        ]
      },
      [] as SubGroupBoundaries[]
    ) ?? []

    const alreadyPronouncedGroups = subsGroupsWithBoundaries.filter(group => group.startId <= (lastPronouncedSub?.id ?? 0))
    const activeGroup = alreadyPronouncedGroups.length === 0
      ? (state.isEnded ? subsGroupsWithBoundaries.at(-1) : subsGroupsWithBoundaries[0])
      : alreadyPronouncedGroups.at(-1)
    const subsArray: VNode[] = []
    subsGroupsWithBoundaries.map(group => {
      const subsNodes: VNode[] = []
      const groupSubs = subsContent.filter(sub => sub.id >= group.startId && sub.id <= group.endId)

      groupSubs.map((sub, index, array) => {
        let subContent = sub.content?.trim() ?? ''
        if (index !== array.length - 1) subContent += ' '

        const subClassList = [styles['sub']]
        const subBemModifiers = []

        if (state.isEnded !== true
          && lastPronouncedSub !== null
          && sub.start <= lastPronouncedSub.start) {
          subClassList.push(styles['sub--pronounced'])
          subBemModifiers.push('pronounced')
        }

        if (state.timecodeInMs >= sub.start
          && state.timecodeInMs <= sub.end) {
          subClassList.push(styles['sub--active'])
          subBemModifiers.push('active')
        }

        subClassList.push(bemClss
          .elt('sub')
          .mod(subBemModifiers)
          .value)
        subsNodes.push(<span
          className={subClassList.join(' ')}>
          {subContent}
        </span>)
      })

      const groupClassList = [styles['subs-group']]
      const groupBemModifiers = []

      if (activeGroup?.startId === group.startId) {
        groupClassList.push(styles['subs-group--active'])
        groupBemModifiers.push('active')
      }

      groupBemModifiers.push(bemClss
        .elt('group')
        .mod(groupBemModifiers)
        .value)
      subsArray.push(<div
        className={groupClassList.join(' ')}>
        {subsNodes}
      </div>)
    })

    return subsArray
  }

  isLoud() {
    if (this.videoElt === null
      || this.videoElt.current === null) return false
    if (this.videoElt.current.muted) return false
    else return true
  }

  isPlaying() {
    if (this.videoElt === null
      || this.videoElt.current === null) return false
    if (this.videoElt.current.paused) return false
    if (this.videoElt.current.ended) return false
    if (this.videoElt.current.currentTime === 0) return false
    if (this.videoElt.current.readyState < 3) return false
    else return true
  }

  isEnded() {
    if (this.videoElt === null
      || this.videoElt.current === null) return false
    if (this.videoElt.current.ended) return true
    else return false
  }

  syncVideoState() {
    if (this.videoElt === null
      || this.videoElt.current === null) return;
    const isLoud = this.isLoud()
    const isPlaying = this.isPlaying()
    const isEnded = this.isEnded()
    this.setState(curr => {
      if (curr.isLoud !== isLoud
        || curr.isPlaying !== isPlaying
        || curr.isEnded !== isEnded) {
        return {
          ...curr,
          isPlaying,
          isLoud,
          isEnded,
          hasEndedOnce: curr.hasEndedOnce === true ? true : isEnded
        }
      }
      return null
    })
  }

  async tryStartPlayback() {
    if (this.videoElt === null
      || this.videoElt.current === null) return
    try {
      await this.videoElt.current.play()
      this.syncVideoState()
    } catch (error) {
      console.error(error)
    }
  }

  tryStopPlayback() {
    if (this.videoElt === null || this.videoElt.current === null) return
    this.videoElt.current.pause()
    this.syncVideoState()
  }

  trySetLoud() {
    if (this.videoElt === null || this.videoElt.current === null) return
    this.videoElt.current.muted = false
    this.syncVideoState()
  }

  trySetMute() {
    if (this.videoElt === null || this.videoElt.current === null) return
    this.videoElt.current.muted = true
    this.syncVideoState()
  }

  handlePlayClick() {
    this.tryStartPlayback()
    this.setState({ hasManuallyPaused: false })
  }

  handlePauseClick() {
    this.tryStopPlayback()
    this.setState({ hasManuallyPaused: true })
  }

  handleLoudClick() {
    this.trySetLoud()
    this.setState({ hasManuallyMuted: false })
  }

  handleMuteClick() {
    this.trySetMute()
    this.setState({ hasManuallyMuted: true })
  }

  handleIntersection(event: IntersectionObserverEntry) {
    // [WIP][ELSA] Si le fichier audio n'est pas encore chargé il faudrait
    // faire en sorte qu'il se lance au chargement (si conditions réunies)
    const { props, state } = this

    // In screen
    if (event.isIntersecting === true) {
      if (props.autoPlayWhenVisible === true
        && state.hasManuallyPaused !== true
        && state.isPlaying !== true
        && state.hasEndedOnce !== true) {
        this.tryStartPlayback()
      }

      if (props.autoLoudWhenVisible === true
        && state.hasManuallyMuted !== true
        && state.isLoud !== true) {
        this.trySetLoud()
      }

      return
    }

    // Off screen
    if (props.autoPauseWhenHidden === true
      && state.isPlaying === true) {
      this.tryStopPlayback()
    }

    if (props.autoMuteWhenHidden === true
      && state.isLoud === true) {
      this.trySetMute()
    }
  }

  /* * * * * * * * * * * * * * * * * * *
     * RENDER
     * * * * * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, state, bemClss } = this

    const wrapperBemClass = bemClss.mod({
      ['is-playing']: state.isPlaying,
      ['is-loud']: state.isLoud,
      ['is-ended']: state.isEnded
    }).value
    const wrapperClasses = [wrapperBemClass, styles['wrapper']]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    if (state.isPlaying === true) wrapperClasses.push(styles['wrapper--is-playing'])
    if (state.isLoud === true) wrapperClasses.push(styles['wrapper--is-loud'])
    if (state.isEnded === true) wrapperClasses.push(styles['wrapper--is-ended'])
    const subsContainerClasses = [bemClss.elt('subs-container').value, styles['subs-container']]
    const videoEltClasses = [bemClss.elt('video').value, styles['video']]
    const titleClasses = [bemClss.elt('title').value, styles['title']]
    const playButtonClasses = [bemClss.elt('play-button').value, styles['play-button']]
    const pauseButtonClasses = [bemClss.elt('pause-button').value, styles['pause-button']]
    const loudButtonClasses = [bemClss.elt('loud-button').value, styles['loud-button']]
    const muteButtonClasses = [bemClss.elt('mute-button').value, styles['mute-button']]

    return <IntersectionObserverComponent
      callback={this.handleIntersection}
      threshold={0.3}>
      <div className={wrapperClasses.join(' ')}>
        {props.title !== undefined
          && <div
          className={titleClasses.join(' ')}>
          {props.title}
        </div>}
        <button
          onClick={this.handlePlayClick}
          className={playButtonClasses.join(' ')}>
          {props.playButton ?? 'Lancer la lecture'}
        </button>
        {props.hidePauseButton !== true
          && <button
          onClick={this.handlePauseClick}
          className={pauseButtonClasses.join(' ')}>
          {props.pauseButton ?? 'Mettre en pause'}
        </button>}
        <button
          onClick={this.handleLoudClick}
          className={loudButtonClasses.join(' ')}>
          {props.loudButton ?? 'Activer le son'}
        </button>
        <button
          onClick={this.handleMuteClick}
          className={muteButtonClasses.join(' ')}>
          {props.muteButton ?? 'Couper le son'}
        </button>
        <video
          src={props.audioSrc}
          ref={this.videoElt}
          className={videoEltClasses.join(' ')}
          controls
          muted
          playsInline />
        <div
          className={subsContainerClasses.join(' ')}>
          {this.getDisplayedSubsContent()}
        </div>
      </div>
    </IntersectionObserverComponent>
  }
}

export type { Props, State }
export default AudioQuote
