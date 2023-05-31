import { isValidElement, render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Thumbnail, { Props } from '~/components/Thumbnail'
import { toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function ThumbnailApp({
  options,
  root,
  silentLogger,
  pageConfig
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
  const expectedString = (val: unknown) => val !== undefined ? toString(val) : undefined
  const expectedStringOrVNode = (val: unknown) => {
    if (val === undefined) return undefined
    return toVNode(val)
  }

  if (customClass !== undefined) props.customClass = expectedString(customClass)
  if (imageUrl !== undefined) props.imageUrl = expectedString(imageUrl)
  if (imageAlt !== undefined) props.imageAlt = expectedString(imageAlt)
  if (textAbove !== undefined) props.textAbove = expectedStringOrVNode(textAbove)
  if (textBelow !== undefined) props.textBelow = expectedStringOrVNode(textBelow)
  if (textLeftTop !== undefined) props.textLeftTop = expectedStringOrVNode(textLeftTop)
  if (textLeftMiddle !== undefined) props.textLeftMiddle = expectedStringOrVNode(textLeftMiddle)
  if (textLeftBottom !== undefined) props.textLeftBottom = expectedStringOrVNode(textLeftBottom)
  if (textRightTop !== undefined) props.textRightTop = expectedStringOrVNode(textRightTop)
  if (textRightMiddle !== undefined) props.textRightMiddle = expectedStringOrVNode(textRightMiddle)
  if (textRightBottom !== undefined) props.textRightBottom = expectedStringOrVNode(textRightBottom)
  if (textCenterTop !== undefined) props.textCenterTop = expectedStringOrVNode(textCenterTop)
  if (textCenterMiddle !== undefined) props.textCenterMiddle = expectedStringOrVNode(textCenterMiddle)
  if (textCenterBottom !== undefined) props.textCenterBottom = expectedStringOrVNode(textCenterBottom)
  if (shadeLinearGradient !== undefined) props.shadeLinearGradient = expectedString(shadeLinearGradient)
  if (shadeBlendMode !== undefined) props.shadeBlendMode = expectedString(shadeBlendMode)
  if (status !== undefined) props.status = expectedString(status)
  if (props.status !== undefined && statusOverrides !== undefined) {
    const statusOverridesProp: Props['statusOverrides'] = {}
    if (statusOverrides!.hasOwnProperty(props.status)) {
      statusOverridesProp[props.status] = optionsToProps((statusOverrides as any)[props.status])
    }
    props.statusOverrides = statusOverridesProp
  }
  if (href !== undefined) props.href = expectedString(href)

  return props
}
