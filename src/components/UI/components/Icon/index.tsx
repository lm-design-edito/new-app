import bem from '~/utils/bem'
import Svg from '~/components/Svg'

export type Props = {
  registry: Map<string, { url: URL, description: string }>
  customClass?: string
  inline?: boolean
  name?: string
}

export default function Icon (props: Props) {
  const bemClss = bem('lmui-icon').mod({ inline: props.inline })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const found = props.registry.get(props.name ?? '')
  if (found === undefined) return null
  const { url, description } = found
  if (props.inline !== true) return <img className={wrapperClasses.join(' ')} src={url.toString()} alt={description} />
  return <Svg className={wrapperClasses.join(' ')} src={url.toString()} desc={description} />
}
