import { render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Header, { Props, CtaActionType } from '~/components/Header'
import { toBoolean, toNumber, toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function HeaderApp({
  options,
  root,
  silentLogger,
  pageConfig
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <Header {...props} />
  render(app, root)
  silentLogger?.log(
    'header-app/rendered',
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
    customClass,
    hideLogo,
    hideNav,
    hideCta,
    fill1,
    fill2,
    fillTransitionTime,
    navItems,
    navItemsAlign,
    ctaContent,
    ctaActionType,
    // ctaOnClick, // Cannot handle functions from options
    panelContent
  } = options
  const props: Props = {}
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (hideLogo !== undefined) { props.hideLogo = toBoolean(hideLogo) }
  if (hideNav !== undefined) { props.hideNav = toBoolean(hideNav) }
  if (hideCta !== undefined) { props.hideCta = toBoolean(hideCta) }
  if (fill1 !== undefined) { props.fill1 = toString(fill1) }
  if (fill2 !== undefined) { props.fill2 = toString(fill2) }
  if (fillTransitionTime !== undefined) { props.fillTransitionTime = toString(fillTransitionTime) }
  if (Array.isArray(navItems)) { 
    const propsNavItems = arrayToNavItems(navItems)
    props.navItems = propsNavItems
  }
  if (navItemsAlign !== undefined) { props.navItemsAlign = toString(navItemsAlign) }
  if (ctaContent !== undefined) { props.ctaContent = toVNode(ctaContent) }
  if (ctaActionType !== undefined) {
    const strCtaActionType = toString(ctaActionType)
    const isActionType = Object
      .values(CtaActionType)
      .includes(strCtaActionType as CtaActionType)
    if (isActionType) { props.ctaActionType = strCtaActionType as CtaActionType }
  }
  if (panelContent !== undefined) { props.panelContent = toVNode(panelContent) }
  return props
}

function arrayToNavItems (array: unknown[]): NonNullable<Props['navItems']> {
  const navItemsProps: NonNullable<Props['navItems']> = []
  array.forEach(unknown => {
    try { Object.keys(unknown as any) }
    catch (err) { return [] }
    const {
      value,
      content,
      isActive
    } = unknown as Record<string, unknown>
    const navItemProps: NonNullable<Props['navItems']>[number] = {}
    if (value !== undefined) { navItemProps.value = toString(value) }
    if (content !== undefined) { navItemProps.content = toVNode(content) }
    if (isActive !== undefined) { navItemProps.isActive = toBoolean(isActive) }
    navItemsProps.push(navItemProps)
  })
  return navItemsProps
}
