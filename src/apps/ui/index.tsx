import { VNode, isValidElement } from 'preact'
import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import iconsData from '~/theme/icons'
import isRecord from '~/utils/is-record'
import { toBoolean, toString } from '~/utils/cast'
import UI, { Component, Props } from '~/components/UI'
import { Props as ButtonProps } from '~/components/UI/components/Button'
import { Props as CheckboxOrRadioProps } from '~/components/UI/components/CheckboxOrRadio'
import { Props as IconProps } from '~/components/UI/components/Icon'
import { Props as TabProps } from '~/components/UI/components/Tab'
import { Props as TabsProps } from '~/components/UI/components/Tabs'
import { Props as TextBoxProps } from '~/components/UI/components/TextBox'
import { Props as ToggleProps } from '~/components/UI/components/Toggle'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: UI }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const { component } = input
  
  // Button
  if (component === Component.BUTTON) {
    const props: ButtonProps = await recordFormat(input, {
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      content: async (i: unknown) => i !== undefined ? await Apps.toStringOrVNodeHelper(i) : undefined,
      size: (i: unknown) => {
        if (i === undefined) return undefined
        const strI = toString(i)
        if (strI === 'large'
          || strI === 'medium'
          || strI === 'small') return strI
        return undefined
      },
      disabled: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
      squared: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
      secondary: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
      iconContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      iconFirst: (i: unknown) => i !== undefined ? toBoolean(i) : undefined
    })
    return { component, ...props }

  // Checkbox or radio
  } else if (component === Component.CHECKBOX || component === Component.RADIO) {
    const props: CheckboxOrRadioProps = await recordFormat(input, {
      type: () => component === Component.RADIO ? 'radio' : 'checkbox',
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      labelContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      disabled: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
      error: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    })
    return { component, ...props }

  // Icon
  } else if (component === Component.ICON) {
    const props: IconProps = await recordFormat(input, {
      registry: () => iconsData,
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      name: (i: unknown) => i !== undefined ? toString(i) : undefined,
      inline: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    })
    return { component, ...props }

  // Tab
  } else if (component === Component.TAB) {
    const props: TabProps = await recordFormat(input, {
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      active: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
      iconContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      iconFirst: (i: unknown) => i !== undefined ? toBoolean(i) : undefined
    })
    return { component, ...props }

  // Tabs
  } else if (component === Component.TABS) {
    const props: TabsProps = await recordFormat(input, {
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      tabs: async (i: unknown) => {
        if (!Array.isArray(i)) return undefined
        const tabsPromise = i.map(async tab => {
          if (isValidElement(tab)) return tab
          if (tab instanceof NodeList) return await Apps.toStringOrVNodeHelper(tab)
          if (isRecord(tab)) return await Apps.render(Apps.Name.UI, null, { component: 'tab', ...tab })
          return undefined
        }).filter((elt): elt is Promise<VNode> => elt !== undefined)
        return await Promise.all(tabsPromise)
      }
    })
    return { component, ...props }

  // Text box
  } else if (component === Component.TEXT_BOX) {
    const props: TextBoxProps = await recordFormat(input, {
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined
    })
    return { component, ...props }

  // Toggle
  } else if (component === Component.TOGGLE) {
    const props: ToggleProps = await recordFormat(input, {
      customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
      labelContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
      size: (i: unknown) => {
        if (i === undefined) return undefined
        const strI = toString(i)
        if (strI === 'medium' || strI === 'small') return strI
        return undefined
      },
      onToggle: i => Apps.makeHandlerHelper(Events.Type.TOGGLE_TOGGLED, i, id),
      defaultChecked: i => i !== undefined ? toBoolean(i) : undefined
    })
    return { component, ...props }

  // Default
  } else {
    return {}
  }
}
