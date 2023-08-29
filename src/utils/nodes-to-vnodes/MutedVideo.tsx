import { Component, JSX } from 'preact'

type Props = JSX.HTMLAttributes<HTMLVideoElement>

export default class MutedVideo extends Component<Props>{
  constructor (props: Props) {
    super(props)
    this.muteAttributeWorkaround = this.muteAttributeWorkaround.bind(this)
  }
  
  $root: HTMLVideoElement | null = null
  
  componentDidMount(): void {
    this.muteAttributeWorkaround()
  }

  componentDidUpdate(): void {
    this.muteAttributeWorkaround()
  }

  muteAttributeWorkaround () {
    const $video = this.$root
    if ($video === null || $video === undefined) return
    const currentMuted = $video.getAttribute('muted')
    if (currentMuted !== null) return
    $video.setAttribute('muted', '')
    $video.load()
  }

  render () {
    const { props } = this
    const { children } = props
    return <video
      {...props}
      ref={n => { this.$root = n }}>
      {children}
    </video>
  }
}
