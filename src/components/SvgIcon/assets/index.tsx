// [WIP][ELSA] Pas forcément besoin d'un fichier à part, ça irait aussi
// bien dans SvgIcon/index.tsx
import ArrowLeft from './arrow-left.svg'
import ArrowRight from './arrow-right.svg'
import FullscreenClose from './fullscreen-close.svg'
import FullscreenOpen from './fullscreen-open.svg'

// [WIP][ELSA] le code ci-dessous pourrait être remplacé par
// enum Icons {
//   ARROW_LEFT = ArrowLeft,
//   ARROW_RIGHT = ArrowRight,
//   FULLSCREEN_CLOSE = FullscreenClose,
//   FULLSCREEN_OPEN = FullscreenOpen
// }

// Ensuite, pour l'utilisation, tu fais:
// import { Icons } from './assets/' (enfin pas besoin d'importer si tu rapatries tout au niveau du dessus)
// type Props { name: Icons }
// <SvgIcon name={Icons.ARROW_LEFT} />
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
