import { VNode, FunctionalComponent } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  tabs?: VNode[]
}

const Tabs: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = bem('lmui-tabs')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <div className={wrapperClasses.join(' ')}>{props.tabs}</div>
}

export default Tabs
