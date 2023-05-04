import { Component, JSX } from 'preact'
import Svg from '~/components/Svg'

import ArrowLeft from './assets/arrow-left.svg'
import ArrowRight from './assets/arrow-right.svg'
import FullscreenClose from './assets/fullscreen-close.svg'
import FullscreenOpen from './assets/fullscreen-open.svg'

enum Icons {
  ARROW_LEFT,
  ARROW_RIGHT,
  FULLSCREEN_CLOSE,
  FULLSCREEN_OPEN
}

const iconsNamesToUrlMap = new Map<Icons, string>()
iconsNamesToUrlMap.set(Icons.ARROW_LEFT, ArrowLeft)
iconsNamesToUrlMap.set(Icons.ARROW_RIGHT, ArrowRight)
iconsNamesToUrlMap.set(Icons.FULLSCREEN_CLOSE, FullscreenClose)
iconsNamesToUrlMap.set(Icons.FULLSCREEN_OPEN, FullscreenOpen)

interface Props {
  file: Icons
}

class Icon extends Component<Props, {}> {

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props } = this
    
    const src = iconsNamesToUrlMap.get(props.file)
    return <Svg src={src} />
  }
}

export { Icons }
export default Icon
