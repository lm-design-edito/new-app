import { Component, JSX, VNode } from 'preact'
import bem from '~/utils/bem'
import Logo from '~/components/Logo'
import Drawer from '~/components/Drawer'
import styles from './styles.module.scss'

export type NavItem = {
  value?: string
  content?: string|VNode
  isActive?: boolean
  clickAction?: 'scroll-to-chapter'
  onClick?: (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
}

export enum CtaActionType {
  TOGGLE_PANEL = 'toggle-panel'
  // [WIP] scroll-top, href, other?
}

export type Props = {
  customClass?: string
  logoHref?: string
  hideLogo?: boolean
  hideNav?: boolean
  hideCta?: boolean
  navItems?: NavItem[]
  navItemsAlign?: string // [WIP] more specific (left|center|right)
  navPosition?: 'top'|'below'
  ctaContent?: string|VNode
  ctaActionType?: CtaActionType
  ctaOnClick?: (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
  subnavContent?: string|VNode
  panelContent?: string|VNode
}

type State = {
  panelIsOpened: boolean
}

export default class Header extends Component<Props, State> {
  bemClss = bem('lm-header')
  state: State = {
    panelIsOpened: false
  }

  constructor (props: Props) {
    super(props)
    this.scrollActiveNavItemIntoView = this.scrollActiveNavItemIntoView.bind(this)
    this.handleCtaClick = this.handleCtaClick.bind(this)
    this.handleNavItemClick = this.handleNavItemClick.bind(this)
  }

  componentDidMount (): void {
    this.scrollActiveNavItemIntoView()
  }

  componentDidUpdate (prevProps: Props): void {
    const prevActiveNavItem = prevProps.navItems?.find(el => el.isActive)?.value
    const activeNavItem = this.props.navItems?.find(el => el.isActive)?.value
    if (activeNavItem && activeNavItem != prevActiveNavItem) {
      this.scrollActiveNavItemIntoView()
    }
  }

  $wrapper: HTMLDivElement|null = null

  scrollActiveNavItemIntoView () {  
    const { $wrapper } = this
    if ($wrapper === null) return
    // Get nav
    const $nav = $wrapper.querySelector(`.${styles['nav']}`)
    if ($nav === null) return
    // Get active item
    const $activeNavItem = $nav.querySelector(`.${styles['nav-item_active']}`)
    if ($activeNavItem === null) return
    // Get elements positions
    const { left, right } = $activeNavItem.getBoundingClientRect()
    const { left: navLeft, right: navRight } = $nav.getBoundingClientRect()
    const scrollMargin = 24
    // Scroll to active item
    if (left - (navLeft + scrollMargin) <= 0) $nav.scrollBy({
      left: left - (navLeft + scrollMargin),
      behavior: 'smooth'
    })
    else if (right - (navRight - scrollMargin) > 0) $nav.scrollBy({
      left: right - (navRight - scrollMargin),
      behavior: 'smooth'
    })
  }

  handleCtaClick (event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    const { props } = this
    const { ctaActionType, ctaOnClick } = props
    if (ctaActionType === CtaActionType.TOGGLE_PANEL) {
      this.setState(curr => ({
        ...curr,
        panelIsOpened: !curr.panelIsOpened
      }))
    }
    if (ctaOnClick !== undefined) ctaOnClick(event)
  }

  handleNavItemClick (navItem: NavItem, event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    const { value, clickAction, onClick } = navItem
    if (clickAction === 'scroll-to-chapter') {
      const targetNode = document.querySelector(`#${value}`)
      if (targetNode !== null) targetNode.scrollIntoView({ behavior: 'smooth' })
    }
    if (onClick !== undefined) onClick(event)
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const {
      props,
      state,
      bemClss,
      handleCtaClick,
      handleNavItemClick
    } = this

    /* Classes and style */
    const hideLogo = props.hideLogo === true
    const hideNav = props.hideNav === true
    const hideCta = props.hideCta === true
    const leftAlignItems = props.navItemsAlign === 'left' || props.navItemsAlign === undefined
    const centerAlignItems = props.navItemsAlign === 'center'
    const rightAlignItems = props.navItemsAlign === 'right'
    const wrapperClasses = [
      bemClss.mod({
        'hide-logo': hideLogo,
        'hide-nav': hideNav,
        'hide-cta': hideCta,
        'nav-items-left-align': leftAlignItems,
        'nav-items-center-align': centerAlignItems,
        'nav-items-right-align': rightAlignItems,
        'nav-below': props.navPosition === 'below',
        'panel-opened': state.panelIsOpened,
        'panel-closed': !state.panelIsOpened
      }).value,
      styles['wrapper']
    ]
    if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
    if (hideLogo) wrapperClasses.push(styles['wrapper_hide-logo'])
    if (hideNav) wrapperClasses.push(styles['wrapper_hide-nav'])
    if (hideCta) wrapperClasses.push(styles['wrapper_hide-cta'])
    if (leftAlignItems) wrapperClasses.push(styles['wrapper_left-align-items'])
    if (centerAlignItems) wrapperClasses.push(styles['wrapper_center-align-items'])
    if (rightAlignItems) wrapperClasses.push(styles['wrapper_right-align-items'])
    if (props.navPosition === 'below') wrapperClasses.push(styles['wrapper_nav-below'])
    const logoClasses = [bemClss.elt('logo').value, styles['logo']]
    const navClasses = [bemClss.elt('nav').value, styles['nav']]
    const ctaWrapperClasses = [bemClss.elt('cta-wrapper').value, styles['cta-wrapper']]
    const subnavClasses = [bemClss.elt('subnav').value, styles['subnav']]
    const panelClasses = [bemClss.elt('panel').value, styles['panel']]
    const hasNavItems = props.navItems !== undefined
      && props.navItems.length > 0
    const navLeftSpacerClasses = [styles['nav-spacer'], styles['nav-left-spacer']]
    const navRightSpacerClasses = [styles['nav-spacer'], styles['nav-right-spacer']]

    /* Display */
    return <div
      ref={n => { this.$wrapper = n }}
      className={wrapperClasses.join(' ')}>
      {/* Logo */}
      <div className={logoClasses.join(' ')}>
        <Logo href={props.logoHref} />
      </div>
      {/* Nav */}
      {/* [WIP] rewrite using gallery */}
      {hasNavItems && <div className={navClasses.join(' ')}>
        <div className={navLeftSpacerClasses.join(' ')} />
        {props.navItems?.map(navItem => {
          const { isActive } = navItem
          const navItemBemClss = bemClss.elt('nav-item').mod({ 'active': isActive })
          const navItemClasses = [navItemBemClss.value, styles['nav-item']]
          if (isActive) navItemClasses.push(styles['nav-item_active'])
          const content = navItem.content ?? navItem.value
          return <button
            className={navItemClasses.join(' ')}
            data-id={navItem.value}
            onClick={e => handleNavItemClick(navItem, e)}>
            {content}
          </button>
        })}
        <div className={navRightSpacerClasses.join(' ')} />
      </div>}
      {/* CTA */}
      {props.ctaContent !== undefined && <button
        className={ctaWrapperClasses.join(' ')}
        onClick={handleCtaClick}>
        {props.ctaContent}
      </button>}
      {/* SUBNAV */}
      <div className={subnavClasses.join(' ')}>
        {props.subnavContent}
      </div>
      {/* PANEL */}
      {/* [WIP] Drawer is now self controlling, cannot be controlled via props. */}
      {/* props.panelContent !== undefined
        && <div className={panelClasses.join(' ')}>
        <Drawer opened={state.panelIsOpened}>
          {props.panelContent}
        </Drawer>
      </div> */}
    </div>
  }
}
