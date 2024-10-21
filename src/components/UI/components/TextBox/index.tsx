import { FunctionalComponent, VNode } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

export type Props = {
  customClass?: string
  content?: string | VNode
}

const TextBox: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = Bem.bem('lmui-text-box')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <p className={bemClss.value}>{props.content}</p>
}

export default TextBox
