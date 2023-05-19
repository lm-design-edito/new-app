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
function optionsToProps(options: Options): Props {
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

  props.customClass = expectedString(customClass)
  props.imageUrl = expectedString(imageUrl)
  props.imageAlt = expectedString(imageAlt)
  props.textAbove = expectedStringOrVNode(textAbove)
  props.textBelow = expectedStringOrVNode(textBelow)
  props.textBeforeTop = expectedStringOrVNode(textBeforeTop)
  props.textBeforeCenter = expectedStringOrVNode(textBeforeCenter)
  props.textBeforeBottom = expectedStringOrVNode(textBeforeBottom)
  props.textAfterTop = expectedStringOrVNode(textAfterTop)
  props.textAfterCenter = expectedStringOrVNode(textAfterCenter)
  props.textAfterBottom = expectedStringOrVNode(textAfterBottom)
  props.textInsideTop = expectedStringOrVNode(textInsideTop)
  props.textInsideCenter = expectedStringOrVNode(textInsideCenter)
  props.textInsideBottom = expectedStringOrVNode(textInsideBottom)
  props.shadeLinearGradient = expectedString(shadeLinearGradient)
  props.shadeBlendMode = expectedString(shadeBlendMode)
  props.status = expectedString(status)
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
  props.href = expectedString(href)
  
  return props
}
