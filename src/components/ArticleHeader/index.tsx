import { Component, JSX, VNode } from 'preact'
import bem from '~/utils/bem'
import Logo from '~/components/Logo'
import styles from './styles.module.scss'
import injectCssRule from '~/utils/dynamic-css'
// import './styles.scss' // [WIP] removed this in order to compile successfully
injectCssRule(`
.lm-article-header .fill-1 {
  fill: var(--fill-1);
  transition: fill var(--fill-transition-time);
}
.lm-article-header .fill-2 {
  fill: var(--fill-2);
  transition: fill var(--fill-transition-time);
}`)

type NavItem = {
  value?: string
  isActive?: boolean
  onClick?: (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
}

type Props = {
  customClass?: string
  customCss?: string
  fill1?: string
  fill2?: string
  fillTransitionTime?: string
  navItems?: NavItem[]
  navItemsAlign?: string // [WIP] more specific (left|center|right)
  ctaContent?: string|VNode
  ctaOnClick?: (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
  // [WIP] add ctaActionType (toggle-panel, href, scroll-top, etc...)
  // [WIP] add support of the toggled-panel
  hideLogo?: boolean
  hideNav?: boolean
  hideCta?: boolean
}

class ArticleHeader extends Component<Props> {
  bemClss = bem('lm-article-header')

  constructor (props: Props) {
    super(props)
    this.scrollActiveNavItemIntoView = this.scrollActiveNavItemIntoView.bind(this)
  }

  componentDidMount(): void {
    this.scrollActiveNavItemIntoView()
  }

  componentDidUpdate(prevProps: Props): void {
    const prevActiveNavItem = prevProps.navItems?.find(el => el.isActive)?.value
    const activeNavItem = this.props.navItems?.find(el => el.isActive)?.value

    if (activeNavItem && activeNavItem != prevActiveNavItem) {
      this.scrollActiveNavItemIntoView()
    }
  }

  $wrapper: HTMLDivElement|null = null

  scrollActiveNavItemIntoView () {  
    // [WIP] prop to decide if autoscroll or not
    const { $wrapper } = this
    if ($wrapper === null) return

    const $nav = $wrapper.querySelector(`.${styles['nav']}`)
    if ($nav === null) return

    const $activeNavItem = $nav.querySelector(`.${styles['nav-item_active']}`)
    if ($activeNavItem === null) return
    
    // [WIP] review that
    const { left, right } = $activeNavItem.getBoundingClientRect()
    const { left: navLeft, right: navRight } = $nav.getBoundingClientRect()
    const scrollMargin = 24
    
    if (left - (navLeft + scrollMargin) <= 0) $nav.scrollBy({ left: left - (navLeft + scrollMargin), behavior: 'smooth' })
    else if (right - (navRight - scrollMargin) > 0) $nav.scrollBy({ left: right - (navRight - scrollMargin), behavior: 'smooth' })
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props, bemClss } = this

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
        'nav-items-right-align': rightAlignItems
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
    const logoClasses = [
      bemClss.elt('logo').value,
      styles['logo']
    ]
    const navClasses = [
      bemClss.elt('nav').value,
      styles['nav']
    ]
    const ctaWrapperClasses = [
      bemClss.elt('cta-wrapper').value,
      styles['cta-wrapper']
    ]

    /* Display */
    return <div
      ref={n => { this.$wrapper = n }}
      className={wrapperClasses.join(' ')}>
      {props.customCss !== undefined && <style>{
        props.customCss
          .trim()
          .replace(/\s+/igm, ' ')
      }</style>}
      <div className={logoClasses.join(' ')}>
        <Logo 
          fill1={props.fill1}
          fill2={props.fill2}
          fillTransitionTime={props.fillTransitionTime}
        />
      </div>
      {props.navItems !== undefined && props.navItems.length > 0 && <div className={navClasses.join(' ')}>
        <div className={`${styles['nav-spacer']} ${styles['nav-left-spacer']}`} />
        {props.navItems?.map(navItem => {
          const { isActive } = navItem
          const navItemBemClss = bemClss.elt('nav-item').mod({ 'active': isActive })
          const navItemClasses = [navItemBemClss.value, styles['nav-item']]
          if (isActive) navItemClasses.push(styles['nav-item_active'])
          return <button
            className={navItemClasses.join(' ')}
            data-id={navItem.value}
            onClick={navItem.onClick}>
            {navItem.value}
          </button>
        })}
        <div className={`${styles['nav-spacer']} ${styles['nav-right-spacer']}`} />
      </div>}
      {props.ctaContent !== undefined && <button
        className={ctaWrapperClasses.join(' ')}
        onClick={props.ctaOnClick}>
        {props.ctaContent}
      </button>}
    </div>
  }
}

export type { Props, NavItem }
export default ArticleHeader
