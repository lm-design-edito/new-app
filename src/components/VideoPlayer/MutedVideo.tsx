// [WIP] this is c/c from /src/shared/utils/lm-html/MutedVideo.tsx

import { Component, JSX } from 'preact'

type Props = JSX.IntrinsicElements['video'] & {
  onRender?: (element: HTMLVideoElement | null) => void
}

export default class MutedVideo extends Component<Props>{
  constructor (props: Props) {
    super(props)
    this.getRootElement = this.getRootElement.bind(this)
    this.muteAttributeWorkaround = this.muteAttributeWorkaround.bind(this)
  }
  
  $root: HTMLVideoElement | null = null
  
  componentDidMount(): void {
    this.muteAttributeWorkaround()
  }

  componentDidUpdate(): void {
    this.muteAttributeWorkaround()
  }

  getRootElement () {
    return this.$root
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
    const { children, onRender, ...rest } = props
    return <video {...rest} ref={n => {
      this.$root = n
      if (onRender !== undefined) onRender(n)
    }}>{children}</video>
  }
}
