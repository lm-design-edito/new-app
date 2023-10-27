import bem from '~/utils/bem'

export type Props = {
  customClass?: string
}

export default function Template (props: Props) {
  const bemClss = bem('lmui-<NAME>')
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  return <></>
}
