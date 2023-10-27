import { Component as PreactComponent } from 'preact'
import Button, { Props as ButtonProps } from './components/Button'
import Icon, { Props as IconProps } from './components/Icon'
import Tab, { Props as TabProps } from './components/Tab'
import Tabs, { Props as TabsProps } from './components/Tabs'

export enum Component {
  BUTTON = 'button',
  ICON = 'icon',
  TAB = 'tab',
  TABS = 'tabs'
}

export type Props =
  ({ component?: Component.BUTTON } & ButtonProps)
  | ({ component?: Component.ICON } & IconProps)
  | ({ component?: Component.TAB } & TabProps)
  | ({ component?: Component.TABS } & TabsProps)

export default class UI extends PreactComponent<Props> {
  render () {
    if (this.props.component === Component.BUTTON) return <Button {...this.props} />
    if (this.props.component === Component.ICON) return <Icon {...this.props} />
    if (this.props.component === Component.TAB) return <Tab {...this.props} />
    if (this.props.component === Component.TABS) return <Tabs {...this.props} />
    return <></>
  }
}
