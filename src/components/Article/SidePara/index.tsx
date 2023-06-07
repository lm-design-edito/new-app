import { Component, JSX, VNode } from 'preact'
import Drawer from '~/components/Drawer'
import ToggleButton from '~/components/ToggleButton'
import bem from '~/utils/bem'

export type Props = {
  openText?: string
  closeText?: string
  openIcon?: VNode
  closeIcon?: VNode
  customClass?: string
}

type State = {
  isOpened: boolean
}

export default class SidePara extends Component<Props, State> {
  state: State = {
    isOpened: false
  }
  constructor (props: Props) {
    super(props)
    this.handleCtaClick = this.handleCtaClick.bind(this)
  }

  handleCtaClick () {
      this.setState(curr => ({
        ...curr,
        isOpened: !curr.isOpened
      }))
  }

  render() {
    const { props, state, handleCtaClick } = this
    const { openText, closeText, openIcon, closeIcon, customClass, children } = props

    const clss = bem('lm-article-side-para')
    const wrapperBemClass = clss.mod({
      ['is-opened']: state.isOpened,
    }).value
    const clsses = [wrapperBemClass]
    if (customClass !== undefined) clsses.push(customClass)

    return (
      <div className={clsses.join(' ')}>
        <ToggleButton 
          isOpen={state.isOpened}
          openText={openText}
          closeText={closeText}
          openIcon={openIcon}
          closeIcon={closeIcon}
          onClick={handleCtaClick}
        />
        <Drawer opened={state.isOpened}>
          {children !== undefined ? children : 'Side Para'}
        </Drawer>
      </div>
    )
  }
}
