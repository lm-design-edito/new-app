console.error('BackgroundVideo component use is deprecated')

export default () => <div>
  BackgroundVideo component.
</div>

// import { Component } from 'preact'
// // [WIP] get rid of can-autoplay
// import canAutoplay from 'can-autoplay'
// import bem from '~/utils/bem'
// // [WIP] css module here
// import './styles.scss'

// interface Props {
//   height?: string|number
//   sourceUrl?: string
//   fallbackUrl?: string
//   play?: boolean
//   idValue?: any
// }

// interface State {
//   isPlaying: boolean
// }

// export default class BackgroundVideo extends Component<Props, State> {
//   /* * * * * * * * * * * * * * *
//    * PROPERTIES
//    * * * * * * * * * * * * * * */
//   static clss = 'lm-background-video'
//   clss = BackgroundVideo.clss
//   $video: HTMLVideoElement|null = null
//   intervalPlayingStateChecker: number|null = null
//   state: State = {
//     isPlaying: false
//   }

//   /* * * * * * * * * * * * * * *
//    * CONSTRUCTOR
//    * * * * * * * * * * * * * * */
//   constructor (props: Props) {
//     super(props)
//     this.canAutoplay = this.canAutoplay.bind(this)
//     this.checkIfPlaying = this.checkIfPlaying.bind(this)
//     this.setPlayingState = this.setPlayingState.bind(this)
//   }

//   /* * * * * * * * * * * * * * *
//    * LIFECYCLE
//    * * * * * * * * * * * * * * */
//   componentDidMount (): void {
//     this.intervalPlayingStateChecker = window.setInterval(() => {
//       this.setPlayingState()
//     }, 500)
//   }

//   componentWillUnmount(): void {
//     if (this.intervalPlayingStateChecker !== null) {
//       window.clearInterval(this.intervalPlayingStateChecker)
//     }
//   }

//   /* * * * * * * * * * * * * * *
//    * METHODS
//    * * * * * * * * * * * * * * */
//   async canAutoplay () {
//     const { result } = await canAutoplay.video({
//       timeout: 100,
//       muted: true
//     })
//     return result
//   }

//   async checkIfPlaying () {
//     const { $video } = this
//     if ($video === null) return false
//     const { paused, ended } = $video
//     return !paused && !ended
//   }

//   async setPlayingState () {
//     const { $video } = this
//     if ($video !== null) {
//       const canAutoplay = await this.canAutoplay()
//       if (canAutoplay) $video.play()
//     }
//     const isPlaying = await this.checkIfPlaying()
//     this.setState({ isPlaying })
//   }

//   /* * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * */
//   render () {
//     const { sourceUrl, fallbackUrl, height } = this.props
//     const { isPlaying } = this.state
//     const wrapperClasses = bem(this.clss).mod({
//       'is-playing': isPlaying,
//       'has-height': height !== undefined
//     })
//     return <div
//       style={{ height }}
//       className={wrapperClasses.value}>
//       {fallbackUrl && <img
//         className={bem(this.clss).elt('fallback').value}
//         src={fallbackUrl} />}
//       <video
//         className={bem(this.clss).elt('video').value}
//         muted
//         loop
//         autoPlay
//         playsInline
//         poster={fallbackUrl}
//         ref={n => { this.$video = n }}
//         src={sourceUrl} />
//     </div>
//   }
// }