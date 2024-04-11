import { FunctionalComponent } from 'preact'
import bem from '~/utils/bem'
import Svg from '~/components/Svg'

export type Props = {
  customClass?: string
  url?: URL | string
  description?: string
  asImg?: boolean
}

const Icon: FunctionalComponent<Props> = (props: Props) => {
  const bemClss = bem('lmui-icon').mod({ inline: props.asImg !== true })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const { url, description } = props
  if (url === undefined) return null
  if (props.asImg) return <img
    className={wrapperClasses.join(' ')}
    src={url.toString()}
    alt={description} />
  return <Svg
    className={wrapperClasses.join(' ')}
    src={url.toString()}
    desc={description} />
}

export default Icon
