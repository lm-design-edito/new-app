import { render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Thumbnail, { Props } from '~/components/Thumbnail'
import { toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function ThumbnailApp({
  options,
  root,
  silentLogger
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Thumbnail {...props} />
  render(app, root)
  silentLogger?.log(
    'thumbnail-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps(options: Options): Props {
  const {
    customClass, //?: string
    imageUrl, //?: string
    imageAlt, //?: string
    textAbove, //?: string|VNode
    textBelow, //?: string|VNode
    textLeftTop, //?: string|VNode
    textLeftMiddle, //?: string|VNode
    textLeftBottom, //?: string|VNode
    textRightTop, //?: string|VNode
    textRightMiddle, //?: string|VNode
    textRightBottom, //?: string|VNode
    textCenterTop, //?: string|VNode
    textCenterMiddle, //?: string|VNode
    textCenterBottom, //?: string|VNode
    shadeLinearGradient, //?: string
    shadeBlendMode, //?: string
    status, //?: string
    statusOverrides, //?: { [statusName: string]: Omit<Props, 'status'|'statusOverrides'> }
    href, //?: string
    // onClick // cannot handle functions from options yet //?: (event?: JSXInternal.TargetedMouseEvent<HTMLDivElement>) => void|Promise<void>
  } = options

  const props: Props = {}
  if (customClass !== undefined) props.customClass = toString(customClass)
  if (imageUrl !== undefined) props.imageUrl = toString(imageUrl)
  if (imageAlt !== undefined) props.imageAlt = toString(imageAlt)
  if (textAbove !== undefined) props.textAbove = toVNode(textAbove)
  if (textBelow !== undefined) props.textBelow = toVNode(textBelow)
  if (textLeftTop !== undefined) props.textLeftTop = toVNode(textLeftTop)
  if (textLeftMiddle !== undefined) props.textLeftMiddle = toVNode(textLeftMiddle)
  if (textLeftBottom !== undefined) props.textLeftBottom = toVNode(textLeftBottom)
  if (textRightTop !== undefined) props.textRightTop = toVNode(textRightTop)
  if (textRightMiddle !== undefined) props.textRightMiddle = toVNode(textRightMiddle)
  if (textRightBottom !== undefined) props.textRightBottom = toVNode(textRightBottom)
  if (textCenterTop !== undefined) props.textCenterTop = toVNode(textCenterTop)
  if (textCenterMiddle !== undefined) props.textCenterMiddle = toVNode(textCenterMiddle)
  if (textCenterBottom !== undefined) props.textCenterBottom = toVNode(textCenterBottom)
  if (shadeLinearGradient !== undefined) props.shadeLinearGradient = toString(shadeLinearGradient)
  if (shadeBlendMode !== undefined) props.shadeBlendMode = toString(shadeBlendMode)
  if (status !== undefined) props.status = toString(status)
  if (props.status !== undefined && statusOverrides !== undefined) {
    const currentStatus = props.status
    const statusOverridesProp: Props['statusOverrides'] = {}
    try {
      const unknownOverrides = (statusOverrides as any)[currentStatus] as unknown
      const overrides = optionsToProps(unknownOverrides as Options)
      statusOverridesProp[currentStatus] = overrides
    } catch (err) {}
    props.statusOverrides = statusOverridesProp
  }
  if (href !== undefined) props.href = toString(href)
  return props
}
