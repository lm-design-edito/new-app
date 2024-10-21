import { FunctionalComponent } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

export type Props = {
  customClass?: string
}

const Template: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = Bem.bem('lmui-<NAME>')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <></>
}

export default Template
