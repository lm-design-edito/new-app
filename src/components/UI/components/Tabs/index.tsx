import { VNode, FunctionalComponent } from 'preact'
import bem from '~/utils/bem'

type OnTabClickPayoad = {
  event: MouseEvent
  tabPos: number
}

export type Props = {
  customClass?: string
  tabs?: VNode[]
  onTabClick?: (payload: OnTabClickPayoad) => void
}

const Tabs: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = bem('lmui-tabs')
  const wrapperClasses = [bemClss.value]
  const tabWrapperClasses = [bemClss.elt('tab')]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <div className={wrapperClasses.join(' ')}>
    {props.tabs?.map((tab, pos) => {
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

export default Tabs
