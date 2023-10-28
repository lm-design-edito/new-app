import { FunctionalComponent } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
}

const Template: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = bem('lmui-<NAME>')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <></>
}

export default Template
