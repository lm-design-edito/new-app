import { FunctionalComponent, JSX } from 'preact'
import bem from '~/utils/bem'
import Svg from '~/components/Svg'
import styles from './styles.module.scss'
console.log(styles)
export type Props = {
  customClass?: string
  url?: URL | string
  description?: string
  asImg?: boolean
  maskColor?: string
}

const Icon: FunctionalComponent<Props> = (props: Props) => {
  const rootBemClss = bem('lmui-icon')
  const wrapperBemClss = rootBemClss.mod({
    ['as-img']: props.asImg,
    ['with-mask']: props.maskColor !== undefined
  })
  const wrapperClasses = [wrapperBemClss.value, styles['wrapper']]
  if (props.asImg) wrapperClasses.push(styles['wrapper_as-img'])
  if (props.maskColor !== undefined) wrapperClasses.push(styles['wrapper_with-mask'])
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const wrapperStyle = {
    '--img-url': `url('${props.url}')`,
    '--mask-color': props.maskColor
  } as JSX.CSSProperties
  const imageMaskBemClss = rootBemClss.elt('image-mask')
  const imageMaskClasses = [imageMaskBemClss.value, styles['image-mask']]
  const maskedBemClss = rootBemClss.elt('masked')
  const maskedClasses = [maskedBemClss.value, styles['masked']]
  const { url, description } = props
  if (url === undefined) return null
  if (props.asImg && props.maskColor !== undefined) return <span
    className={wrapperClasses.join(' ')}
    style={wrapperStyle}>
    <img className={imageMaskClasses.join(' ')} src={url.toString()} alt={description} />
    <span className={maskedClasses.join(' ')} />
  </span>
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
