import { VNode, isValidElement } from 'preact'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { Cast } from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import UI, { Component, Props } from '~/components/UI'
import { Theme } from '~/shared/theme'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: UI }
}

async function toProps (input: unknown, id: string): Promise<Props> {

  if (!isRecord(input)) return {}
  const { component } = input
  
  // Button
  if (component === Component.BUTTON) {
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.BUTTON,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      content: async i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      size: i => Apps.ifNotUndefinedHelper(i, i => {
        const strI = Cast.toString(i)
        if (strI === 'large' || strI === 'medium' || strI === 'small') return strI
        return undefined
      }),
      disabled: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      squared: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      secondary: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      iconContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      iconFirst: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      
      // Handlers
      onClick: i => Apps.makeHandlerHelper(Events.Type.BUTTON_CLICK, i, id)
    }) ?? {}

  // Checkbox or radio
  } else if (component === Component.CHECKBOX || component === Component.RADIO) {
    const type = component === Component.RADIO ? 'radio' : 'checkbox'
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.CHECKBOX | Component.RADIO,
      type: () => type,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      labelContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      disabled: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      error: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      defaultchecked: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),

      // Handlers
      onChange: i => Apps.makeHandlerHelper(Events.Type.CHECKBOX_OR_RADIO_CHANGE, i, id)
    }) ?? {}

  // Icon
  } else if (component === Component.ICON) {
    const iconName = Apps.ifNotUndefinedHelper(input.name, Cast.toString)
    const iconData = iconName !== undefined ? Theme.getIconData(iconName) : undefined
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.ICON,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      url: i => Apps.ifNotUndefinedHelper(i, Cast.toString) ?? iconData?.url,
      description: i => Apps.ifNotUndefinedHelper(i, Cast.toString) ?? iconData?.description,
      asImg: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      maskColor: i => Apps.ifNotUndefinedHelper(i, Cast.toString)
    }) ?? {}
    
  // Tab
  } else if (component === Component.TAB) {
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.TAB,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      active: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
      iconContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      iconFirst: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),

      // Handlers
      onClick: i => Apps.makeHandlerHelper(Events.Type.TAB_CLICK, i, id)
    }) ?? {}

  // Tabs
  } else if (component === Component.TABS) {
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.TABS,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      tabs: i => Apps.ifArrayHelper(i, async i => await Promise.all(
        i.map(async tab => {
          if (isValidElement(tab)) return tab
          if (tab instanceof NodeList) return await Apps.toStringOrVNodeHelper(tab)
          if (isRecord(tab)) return await Apps.render(Apps.Name.UI, null, { component: 'tab', ...tab })
          return undefined
        }).filter((elt): elt is Promise<VNode> => elt !== undefined)
      )),

      // Handlers
      onTabsClick: i => Apps.makeHandlerHelper(Events.Type.TABS_TAB_CLICK, i, id)
    }) ?? {}

  // Text box
  } else if (component === Component.TEXT_BOX) {
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.TEXT_BOX,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper)
    }) ?? {}

  // Toggle
  } else if (component === Component.TOGGLE) {
    return await Apps.toPropsHelper(input, {
      component: () => component as Component.TOGGLE,
      customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      labelContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      size: i => Apps.ifNotUndefinedHelper(i, i => {
        const strI = Cast.toString(i)
        if (strI === 'medium' || strI === 'small') return strI
        return undefined
      }),
      defaultChecked: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),

      // Handlers
      onToggle: i => Apps.makeHandlerHelper(Events.Type.TOGGLE_TOGGLED, i, id),
    }) ?? {}

  // Default
  } else {
    return {}
  }
}
