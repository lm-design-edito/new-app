import { render } from 'preact'
import { Options, Renderer } from '~/shared-utils/lm-page-apps'
import Scrllgngn, { Props } from '~/components/Scrllgngn'

const optionsToProps = (options: Options): Props => {

  // export type PropsPageData = {
  //   id?: string
  //   showHeader?: boolean
  //   showNav?: boolean
  //   headerLogoFill1?: string
  //   headerLogoFill2?: string
  //   headerCustomClass?: string
  //   headerCustomCss?: string
  //   headerNavItemsAlign?: string
  //   chapterName?: string
  //   isChapterHead?: boolean
  //   bgColor?: JSX.CSSProperties['backgroundColor']
  //   blocks?: PropsBlockData[]
  // }
  
  // export type Props = {
  //   stickyBlocksLazyLoadDistance?: number
  //   stickyBlocksViewportHeight?: string // [WIP] No relative units, maybe some regex checks here?
  //   stickyBlocksOffsetTop?: number
  //   thresholdOffset?: string
  //   bgColorTransitionDuration?: string|number
  //   pages?: PropsPageData[]
  //   headerCustomClass?: string
  //   headerCustomCss?: string
  //   headerNavItemsAlign?: string // [WIP] more specific ? map to ArticleHeader Props?
  //   onHalfVisible?: () => void
  //   onHalfHidden?: () => void
  //   onEndVisible?: () => void
  //   onEndHidden?: () => void
  // }

  const props: Props = {}

  // stickyBlocksLazyLoadDistance
  if (typeof options.stickyBlocksLazyLoadDistance === 'number') props.stickyBlocksLazyLoadDistance = options.stickyBlocksLazyLoadDistance
  if (typeof options.stickyBlocksLazyLoadDistance === 'string') props.stickyBlocksLazyLoadDistance = window.parseInt(options.stickyBlocksLazyLoadDistance)
  // stickyBlocksViewportHeight
  if (typeof options.stickyBlocksViewportHeight === 'string') props.stickyBlocksViewportHeight = options.stickyBlocksViewportHeight
  // stickyBlocksOffsetTop
  if (typeof options.stickyBlocksOffsetTop === 'number') props.stickyBlocksOffsetTop = options.stickyBlocksOffsetTop
  if (typeof options.stickyBlocksOffsetTop === 'string') props.stickyBlocksOffsetTop = window.parseInt(options.stickyBlocksOffsetTop)
  // thresholdOffset
  if (typeof options.thresholdOffset === 'string') props.thresholdOffset = options.thresholdOffset
  // bgColorTransitionDuration
  if (typeof options.bgColorTransitionDuration === 'number') props.bgColorTransitionDuration = options.bgColorTransitionDuration
  if (typeof options.bgColorTransitionDuration === 'string') props.bgColorTransitionDuration = options.bgColorTransitionDuration
  // [WIP]

  return {}
}

const ScrllgngnApp: Renderer = ({
  options,
  root,
  silentLogger,
  pageConfig
}) => {
  const props = optionsToProps(options)
  render(<Scrllgngn {...props} />, root)
}

export default ScrllgngnApp
