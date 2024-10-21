import { VNode, Component, toChildArray } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

type OnTabClickPayoad = {
  event: MouseEvent
  tabPos: number
}

export type Props = {
  customClass?: string
  tabs?: VNode[]
  onTabClick?: (payload: OnTabClickPayoad) => void
}

export default class Tabs extends Component<Props> {
  render () {
    const { props } = this
    const bemClss = Bem.bem('lmui-tabs')
    const wrapperClasses = [bemClss.value]
    const tabWrapperClasses = [bemClss.elt('tab').value]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    const tabs = props.tabs ?? []
    const children = toChildArray(props.children)
    return <div className={wrapperClasses.join(' ')}>
      {[...tabs, ...children]?.map((tab, pos) => {
        const handler = (e: MouseEvent) => props?.onTabClick?.({
          event: e,
          tabPos: pos
        })
        return <div
          className={tabWrapperClasses.join(' ')}
          onClick={handler}>
          {tab}
        </div>
      })}
    </div>
  }
}
