import ArrowLeft from './arrow-left.svg'
import ArrowRight from './arrow-right.svg'
import FullscreenClose from './fullscreen-close.svg'
import FullscreenOpen from './fullscreen-open.svg'

interface Icons {
  [name: string]: string
}

const icons: Icons = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'fullscreen-close': FullscreenClose,
  'fullscreen-open': FullscreenOpen,
}

export default icons
