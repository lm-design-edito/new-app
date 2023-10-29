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
    if (this.props.component === Component.BUTTON) return <Button {...this.props} />
    if (this.props.component === Component.CHECKBOX) return <CheckboxOrRadio {...this.props} type='checkbox' />
    if (this.props.component === Component.RADIO) return <CheckboxOrRadio {...this.props} type='radio' />
    if (this.props.component === Component.ICON) return <Icon {...this.props} />
    if (this.props.component === Component.TAB) return <Tab {...this.props} />
    if (this.props.component === Component.TABS) return <Tabs {...this.props} />
    if (this.props.component === Component.TEXT_BOX) return <TextBox {...this.props} />
    if (this.props.component === Component.TOGGLE) return <Toggle {...this.props} />
    return <></>
  }
}
