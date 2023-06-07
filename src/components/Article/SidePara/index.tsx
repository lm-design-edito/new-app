import { Component, JSX, VNode } from 'preact'
import Drawer from '~/components/Drawer'
import bem from '~/utils/bem'

export type Props = {
  label?: string|VNode
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

  handleCtaClick (event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
      this.setState(curr => ({
        ...curr,
        isOpened: !curr.isOpened
      }))
  }

  render() {
    const { props, state, handleCtaClick } = this
    const { label, customClass, children } = props

    const clss = bem('lm-article-side-para')
    const wrapperBemClass = clss.mod({
      ['is-opened']: state.isOpened,
    }).value
    const clsses = [wrapperBemClass]
    if (customClass !== undefined) clsses.push(customClass)

    const labelClss = clss.elt('label')

    return (
      <div className={clsses.join(' ')}>
        <button onClick={handleCtaClick} className={labelClss.value}>
          {label !== undefined ? label : 'Side Para label'}
        </button>
        <Drawer opened={state.isOpened}>
          {children !== undefined ? children : 'Side Para'}
        </Drawer>
      </div>
    )
  }
}
