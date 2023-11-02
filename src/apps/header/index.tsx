import { Apps } from 'apps'
import Logger from '~/utils/silent-log'
import { toString, toBoolean } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import isInEnum from '~/utils/is-in-enum'
import Header, { Props, CtaActionType } from '~/components/Header'

export default async function renderer (
  unknownProps: unknown,
  id: string,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Header }
}

async function toProps (input: unknown, id: string, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const {
    customClass,
    logoHref,
    hideLogo,
    hideNav,
    hideCta,
    navItems,
    navItemsAlign,
    navPosition,
    ctaContent,
    ctaActionType,
    // ctaOnClick, // Cannot handle functions from options
    subnavContent,
    panelContent
  } = input
  const props: Props = {}
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (logoHref !== undefined) { props.logoHref = toString(logoHref) }
  if (hideLogo !== undefined) { props.hideLogo = toBoolean(hideLogo) }
  if (hideNav !== undefined) { props.hideNav = toBoolean(hideNav) }
  if (hideCta !== undefined) { props.hideCta = toBoolean(hideCta) }
  if (Array.isArray(navItems)) { props.navItems = await arrayToNavItems(navItems, logger) }
  if (navItemsAlign !== undefined) { props.navItemsAlign = toString(navItemsAlign) }
  if (navPosition !== undefined) {
    const strNavPosition = toString(navPosition)
    if (strNavPosition === 'top' || strNavPosition === 'below') { props.navPosition = strNavPosition }
  }
  if (ctaContent !== undefined) { props.ctaContent = await Apps.toStringOrVNodeHelper(ctaContent, logger) }
  if (ctaActionType !== undefined) {
    const strCtaActionType = toString(ctaActionType)
    if (isInEnum(CtaActionType, strCtaActionType)) { props.ctaActionType = strCtaActionType }
  }
  if (subnavContent !== undefined) { props.subnavContent = await Apps.toStringOrVNodeHelper(subnavContent, logger) }
  if (panelContent !== undefined) { props.panelContent = await Apps.toStringOrVNodeHelper(panelContent, logger) }
  return props
}

async function arrayToNavItems (array: unknown[], logger?: Logger): Promise<Props['navItems']> {
  const navItemsProps: NonNullable<Props['navItems']> = []
  for (const item of array) {
    if (!isRecord(item)) continue
    const {
      value,
      content,
      clickAction,
      isActive
    } = item
    const navItemProps: NonNullable<Props['navItems']>[number] = {}
    if (value !== undefined) { navItemProps.value = toString(value) }
    if (content !== undefined) { navItemProps.content = await Apps.toStringOrVNodeHelper(content, logger) }
    if (clickAction !== undefined) {
      const strClickAction = toString(clickAction)
      if (strClickAction === 'scroll-to-chapter') { navItemProps.clickAction = strClickAction }
    }
    if (isActive !== undefined) { navItemProps.isActive = toBoolean(isActive) }
    navItemsProps.push(navItemProps)
  }
  return navItemsProps
}
