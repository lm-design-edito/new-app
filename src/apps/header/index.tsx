import { Component, render } from 'preact'
import { Options, Renderer } from '~/shared/lm-page-apps'
import Header, { Props, CtaActionType } from '~/components/Header'
import { toBoolean, toString, toVNode } from '~/utils/cast'
import EventCatcher, { Handler } from '~/components/EventCatcher'
import { Instruction } from '~/components/EventDispatcher'

/* * * * * * * * * * * * * * * * * * *
 * EVENT CATCHER WRAPPER
 * * * * * * * * * * * * * * * * * * */
class EventCatchingHeaderApp extends Component<Props, Props> {
  state: Props = { ...this.props }

  constructor (props: Props) {
    super(props)
    this.handleSetHeaderPropsEvent = this.handleSetHeaderPropsEvent.bind(this)
    this.handleUpdateHeaderPropsEvent = this.handleUpdateHeaderPropsEvent.bind(this)
  }

  handleSetHeaderPropsEvent: Handler = payload => {
    const headerPropsPayload = optionsToProps(payload)
    this.setState(curr => {
      const newState: Props = {}
      Object.keys(curr).forEach(_key => {
        const key = _key as keyof Props
        newState[key] = undefined
      })
      return {
        ...newState,
        ...headerPropsPayload
      }
    })
  }
  
  handleUpdateHeaderPropsEvent: Handler = payload => {
    const headerPropsPayload = optionsToProps(payload)
    this.setState(curr => ({
      ...curr,
      ...headerPropsPayload
    }))
  }
  
  render () {
    const {
      state,
      handleSetHeaderPropsEvent,
      handleUpdateHeaderPropsEvent
    } = this
    return <EventCatcher
      on={[[
        Instruction.SET_HEADER_PROPS,
        handleSetHeaderPropsEvent
      ], [
        Instruction.UPDATE_HEADER_PROPS,
        handleUpdateHeaderPropsEvent
      ]]}>
      <Header {...state} />
    </EventCatcher>
  }
}

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function HeaderApp({
  options,
  root,
  silentLogger
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <EventCatchingHeaderApp {...props} />
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
    logoHref,
    hideLogo,
    hideNav,
    hideCta,
    navItems,
    navItemsAlign,
    ctaContent,
    ctaActionType,
    // ctaOnClick, // Cannot handle functions from options
    subnavContent,
    panelContent
  } = options
  const props: Props = {}
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (logoHref !== undefined) { props.logoHref = toString(logoHref) }
  if (hideLogo !== undefined) { props.hideLogo = toBoolean(hideLogo) }
  if (hideNav !== undefined) { props.hideNav = toBoolean(hideNav) }
  if (hideCta !== undefined) { props.hideCta = toBoolean(hideCta) }
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
  if (subnavContent !== undefined) { props.subnavContent = toVNode(subnavContent) }
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
