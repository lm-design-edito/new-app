import { Component, JSX } from 'preact'
import Svg from '~/components/Svg'

import ArrowLeft from './assets/arrow-left.svg'
import ArrowRight from './assets/arrow-right.svg'
import FullscreenClose from './assets/fullscreen-close.svg'
import FullscreenOpen from './assets/fullscreen-open.svg'
import ToggleClose from './assets/toggle-close.svg'
import ToggleOpen from './assets/toggle-open.svg'
import Sound from './assets/sound.svg'
import Muted from './assets/muted.svg'
import Play from './assets/play.svg'
import Pause from './assets/pause.svg'

enum Icons {
  ARROW_LEFT,
  ARROW_RIGHT,
  FULLSCREEN_CLOSE,
  FULLSCREEN_OPEN,
  TOGGLE_CLOSE,
  TOGGLE_OPEN,
  SOUND,
  MUTED,
  PLAY,
  PAUSE
}

const iconsNamesToUrlMap = new Map<Icons, string>()
iconsNamesToUrlMap.set(Icons.ARROW_LEFT, ArrowLeft)
iconsNamesToUrlMap.set(Icons.ARROW_RIGHT, ArrowRight)
iconsNamesToUrlMap.set(Icons.FULLSCREEN_CLOSE, FullscreenClose)
iconsNamesToUrlMap.set(Icons.FULLSCREEN_OPEN, FullscreenOpen)
iconsNamesToUrlMap.set(Icons.TOGGLE_CLOSE, ToggleClose)
iconsNamesToUrlMap.set(Icons.TOGGLE_OPEN, ToggleOpen)
iconsNamesToUrlMap.set(Icons.SOUND, Sound)
iconsNamesToUrlMap.set(Icons.MUTED, Muted)
iconsNamesToUrlMap.set(Icons.PLAY, Play)
iconsNamesToUrlMap.set(Icons.PAUSE, Pause)

interface Props {
  file: Icons,
  className?: string
}

class Icon extends Component<Props, {}> {

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props } = this
    
    const src = iconsNamesToUrlMap.get(props.file)
    return <Svg src={src} className={props.className} />
  }
}

export { Icons }
export default Icon
