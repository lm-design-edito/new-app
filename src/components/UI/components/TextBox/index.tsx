import { FunctionalComponent, VNode } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  content?: string | VNode
}

const TextBox: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = bem('lmui-text-box')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <p class={bemClss.value}>{props.content}</p>
}

export default TextBox
