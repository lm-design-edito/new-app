import { VNode, isValidElement } from 'preact'
import { Apps } from '~/apps'
import iconsData from '~/theme/icons'
import Logger from '~/utils/silent-log'
import isRecord from '~/utils/is-record'
import { toBoolean, toString } from '~/utils/cast'
import UI, { Component, Props } from '~/components/UI'
import { Props as ButtonProps } from '~/components/UI/components/Button'
import { Props as IconProps } from '~/components/UI/components/Icon'
import { Props as TabProps } from '~/components/UI/components/Tab'
import { Props as TabsProps } from '~/components/UI/components/Tabs'

export default async function renderer (
  unknownProps: unknown,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, logger)
  const component = <UI {...props} />
  return { props, component }
}

async function toProps (input: unknown, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const { component } = input
  
  // Button
  if (component === Component.BUTTON) {
    const props: ButtonProps = {}
    const { customClass, content, size, disabled, squared, secondary, iconName, inlineIcon } = input
    if (customClass !== undefined) { props.customClass = toString(customClass) }
    if (content !== undefined) { props.content = await Apps.toStringOrVNodeHelper(content, logger) }
    if (size !== undefined) {
      const strSize = toString(size)
      if (strSize === 'large' || strSize === 'medium' || strSize === 'small') { props.size = strSize }
    }
    if (disabled !== undefined) { props.disabled = toBoolean(disabled) }
    if (squared !== undefined) { props.squared = toBoolean(squared) }
    if (secondary !== undefined) { props.secondary = toBoolean(secondary) }
    if (iconName !== undefined) {
      props.icon = (await renderer({
        component: Component.ICON,
        registry: iconsData,
        name: toString(iconName),
        inline: inlineIcon !== undefined ? toBoolean(inlineIcon) : false
      } as IconProps, logger)).component
    }
    return { component, ...props }

  // Icon
  } else if (component === Component.ICON) {
    const props: IconProps = { registry: iconsData }
    const { customClass, name, inline } = input
    if (customClass !== undefined) { props.customClass = toString(customClass) }
    if (name !== undefined) { props.name = toString(name) }
    if (inline !== undefined) { props.inline = toBoolean(inline) }
    return { component, ...props }

  // Tab
  } else if (component === Component.TAB) {
    const props: TabProps = {}
    const { customClass, enabled, content, iconName, inlineIcon } = input
    if (customClass !== undefined) { props.customClass = toString(customClass) }
    if (content !== undefined) { props.content = await Apps.toStringOrVNodeHelper(content, logger) }
    if (enabled !== undefined) { props.enabled = toBoolean(enabled) }
    if (iconName !== undefined) {
      props.icon = (await renderer({
        component: Component.ICON,
        registry: iconsData,
        name: toString(iconName),
        inline: inlineIcon !== undefined ? toBoolean(inlineIcon) : false
      } as IconProps, logger)).component
    }
    return { component, ...props }

  // Tabs
  } else if (component === Component.TABS) {
    const props: TabsProps = {}
    const { customClass, tabs } = input
    if (customClass !== undefined) { props.customClass = toString(customClass) }
    if (Array.isArray(tabs)) {
      const tabsPromise = tabs.map(async tab => {
        console.log(tab)
        if (isValidElement(tab)) return tab
        if (tab instanceof NodeList) return await Apps.toStringOrVNodeHelper(tab, logger)
        if (isRecord(tab)) return (await renderer({
          component: Component.TAB,
          ...tab
        } as TabProps, logger)).component
        return undefined
      }).filter((elt): elt is Promise<VNode> => elt !== undefined)
      props.tabs = await Promise.all(tabsPromise)
    }
    return { component, ...props }
  }

  // Default
  return {}
}
