import { Component as PreactComponent } from 'preact'
import Button, { Props as ButtonProps } from './components/Button'
import CheckboxOrRadio, { Props as CheckboxOrRadioProps } from './components/CheckboxOrRadio'
import Icon, { Props as IconProps } from './components/Icon'
import Tab, { Props as TabProps } from './components/Tab'
import Tabs, { Props as TabsProps } from './components/Tabs'
import TextBox, { Props as TextBoxProps } from './components/TextBox'
import Toggle, { Props as ToggleProps } from './components/Toggle'

export enum Component {
  BUTTON = 'button',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  ICON = 'icon',
  TAB = 'tab',
  TABS = 'tabs',
  TEXT_BOX = 'text-box',
  TOGGLE = 'toggle'
}

export type Props =
  ({ component?: Component.BUTTON } & ButtonProps)
  | ({ component?: Component.CHECKBOX } & CheckboxOrRadioProps)
  | ({ component?: Component.RADIO } & CheckboxOrRadioProps)
  | ({ component?: Component.ICON } & IconProps)
  | ({ component?: Component.TAB } & TabProps)
  | ({ component?: Component.TABS } & TabsProps)
  | ({ component?: Component.TEXT_BOX } & TextBoxProps)
  | ({ component?: Component.TOGGLE } & ToggleProps)

export default class UI extends PreactComponent<Props> {
  render () {
    const { props } = this
    if (props.component === Component.BUTTON) return <Button {...props} />
    if (props.component === Component.CHECKBOX) return <CheckboxOrRadio {...props} type='checkbox' />
    if (props.component === Component.RADIO) return <CheckboxOrRadio {...props} type='radio' />
    if (props.component === Component.ICON) return <Icon {...props} />
    if (props.component === Component.TAB) return <Tab {...props} />
    if (props.component === Component.TABS) return <Tabs {...props} />
    if (props.component === Component.TEXT_BOX) return <TextBox {...props} />
    if (props.component === Component.TOGGLE) return <Toggle {...props} />
    return <></>
  }
}
