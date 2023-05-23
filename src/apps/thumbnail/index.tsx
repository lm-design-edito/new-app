import { isValidElement, render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Thumbnail, { Props } from '~/components/Thumbnail'
import { toString } from '~/utils/cast'

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
    textBeforeTop, //?: string|VNode
    textBeforeCenter, //?: string|VNode
    textBeforeBottom, //?: string|VNode
    textAfterTop, //?: string|VNode
    textAfterCenter, //?: string|VNode
    textAfterBottom, //?: string|VNode
    textInsideTop, //?: string|VNode
    textInsideCenter, //?: string|VNode
    textInsideBottom, //?: string|VNode
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
    if (isValidElement(val)) return val
    return toString(val)
  }

  if (customClass !== undefined) props.customClass = expectedString(customClass)
  if (imageUrl !== undefined) props.imageUrl = expectedString(imageUrl)
  if (imageAlt !== undefined) props.imageAlt = expectedString(imageAlt)
  if (textAbove !== undefined) props.textAbove = expectedStringOrVNode(textAbove)
  if (textBelow !== undefined) props.textBelow = expectedStringOrVNode(textBelow)
  if (textBeforeTop !== undefined) props.textBeforeTop = expectedStringOrVNode(textBeforeTop)
  if (textBeforeCenter !== undefined) props.textBeforeCenter = expectedStringOrVNode(textBeforeCenter)
  if (textBeforeBottom !== undefined) props.textBeforeBottom = expectedStringOrVNode(textBeforeBottom)
  if (textAfterTop !== undefined) props.textAfterTop = expectedStringOrVNode(textAfterTop)
  if (textAfterCenter !== undefined) props.textAfterCenter = expectedStringOrVNode(textAfterCenter)
  if (textAfterBottom !== undefined) props.textAfterBottom = expectedStringOrVNode(textAfterBottom)
  if (textInsideTop !== undefined) props.textInsideTop = expectedStringOrVNode(textInsideTop)
  if (textInsideCenter !== undefined) props.textInsideCenter = expectedStringOrVNode(textInsideCenter)
  if (textInsideBottom !== undefined) props.textInsideBottom = expectedStringOrVNode(textInsideBottom)
  if (shadeLinearGradient !== undefined) props.shadeLinearGradient = expectedString(shadeLinearGradient)
  if (shadeBlendMode !== undefined) props.shadeBlendMode = expectedString(shadeBlendMode)
  if (status !== undefined) props.status = expectedString(status)
  if (statusOverrides !== undefined) {
    const statusOverridesProp: Props['statusOverrides'] = {}
    try {
      const statusOverridesNames = Object.keys(statusOverrides as Options)
      statusOverridesNames.forEach(statusOverrideName => {
        const statusOverride = (statusOverrides as Options)[statusOverrideName]
        try {
          Object.keys(statusOverride as Options)
          statusOverridesProp[statusOverrideName] = optionsToProps(statusOverride as Options)
        } catch (err) {}
      })
    } catch (err) {}
    props.statusOverrides = statusOverridesProp
  }
  if (status !== undefined) props.href = expectedString(href)
  
  return props
}
