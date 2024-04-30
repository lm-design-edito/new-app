import { render as preactRender, VNode } from 'preact'
import appConfig from '~/config'
import { Externals } from '~/shared/externals'
import randomUUID from '~/utils/random-uuid'

export namespace Slots {

  let isolationMode = true

  export function setIsolationMode (bool: boolean = true): void {
    isolationMode = bool
    refreshSlotsIsolation()
    refreshStyles()
  }

  export const created = new Set<Element>()

  type StyleData = {
    id: string
    type: 'url' | 'css'
    content: string
    name?: string
    position?: number
  }

  export const styles = new Set<StyleData>()

  export enum StylesPositions {
    GENERAL = 0,
    APP = 1,
    CUSTOM = 2
  }

  type InjectStylesOptions = {
    name?: string,
    position?: StylesPositions
  }

  export function injectStyles (
    as: 'url' | 'css',
    content: string,
    options: InjectStylesOptions = {}) {
    const { name, position } = options
    const exists = [...styles].find(item => (item.type === as
      && item.content === content
      && item.name === name))
    const id = randomUUID().split('-')[0] ?? ''
    if (exists !== undefined) return
    styles.add({ id, type: as, content, name, position })
    refreshStyles()
  }

  function removeStyle (name: string) {
    const found = [...styles].find(styleData => styleData.name === name)
    if (found === undefined) return;
    styles.delete(found)
    refreshStyles()
  }

  export function removeStyles (...names: string[]) {
    names.forEach(name => removeStyle(name))
  }

  export function renderStylesInTarget (target: Element) {
    const sortedStyles = Array.from(styles).sort((a, b) => {
      return (a.position ?? 0) - (b.position ?? 0)
    })
    return preactRender(<>
      {sortedStyles.map(styleData => {
        if (styleData.type === 'css') return <style
          name={styleData.name}
          data-lmid={styleData.id}
          key={styleData.id}>
          {styleData.content}
        </style>
        else if (styleData.type === 'url') return <link
          name={styleData.name}
          href={styleData.content}
          rel='stylesheet'
          data-lmid={styleData.id}
          key={styleData.id} />
        return null
      })}
    </>, target)
  }

  export function removeStylesFromSlots () {
    created.forEach((slotRootElt) => {
      const stylesElt = getSlotChild(slotRootElt, 'styles')
      if (stylesElt === null) return;
      preactRender(<></>, stylesElt)
    })
  }

  export function getStylesElementFromHead () {
    const found = document.head.querySelector(`.${appConfig.slots.headStylesElementClass}`)
    if (found !== null) return found
    const created = document.createElement('div')
    created.classList.add(appConfig.slots.headStylesElementClass)
    document.head.append(created)
    return created
  }

  export function removeStylesFromHead () {
    preactRender(<></>, getStylesElementFromHead())
  }

  export function refreshStyles () {
    if (isolationMode === true) {
      // Isolation mode : render styles in each slot
      removeStylesFromHead()
      created.forEach(slotElement => {
        console.log('refresh for', slotElement)
        const stylesElt = getSlotChild(slotElement, 'styles')
        if (stylesElt === null) return;
        renderStylesInTarget(stylesElt)
      })
    } else {
      // No isolation mode : render styles in head
      removeStylesFromSlots()
      const headStylesTarget = getStylesElementFromHead()
      renderStylesInTarget(headStylesTarget)
    }
  }

  export function makeSlot (slotRootElt: Element, content: VNode[] | string): Element | undefined {
    if (created.has(slotRootElt)) return;
    slotRootElt.classList.add(appConfig.slots.rootElementClass)

    // Create styles element
    const stylesElt = document.createElement('div')
    stylesElt.classList.add(appConfig.slots.styleElementClass)

    // Create content element
    const contentElt = document.createElement('div')
    contentElt.classList.add(appConfig.slots.contentElementClass)
    preactRender(<>{content}</>, contentElt)

    // Create slot inner element
    const innerElt = document.createElement('div')
    innerElt.classList.add(appConfig.slots.innerElementClass)
    innerElt.append(stylesElt, contentElt)

    // Create shadow and light elements
    const shadowElt = document.createElement('div')
    const lightElt = document.createElement('div')
    shadowElt.classList.add(appConfig.slots.shadowElementClass)
    lightElt.classList.add(appConfig.slots.lightElementClass)
    slotRootElt.append(shadowElt, lightElt)

    if (isolationMode === true) {
      // Isolation mode, create ShadowRoot
      const shadow = shadowElt.attachShadow({ mode: 'open' })
      shadow.append(innerElt)
      created.add(slotRootElt)
    } else {
      // No isolation mode, render in slotRootElt
      lightElt.append(innerElt)
      created.add(slotRootElt)
    }

    // External context detection
    Externals.setDeviceContextAttribute(innerElt)
    Externals.setColorModeContextAttribute(innerElt)
    Externals.setParentSnippetAttribute(innerElt)

    // Inject styles to their targets
    refreshStyles()

    // Return
    return contentElt
  }

  export function slotIsIsolated (slotRootElt: Element) {
    const lightInner = slotRootElt.querySelector(`.${appConfig.slots.innerElementClass}`)
    if (lightInner !== null) return false
    const shadow = slotRootElt.querySelector(`.${appConfig.slots.shadowElementClass}`)?.shadowRoot ?? null
    if (shadow === null) return false
    const shadowInner = shadow.querySelector(`.${appConfig.slots.innerElementClass}`)
    if (shadowInner === null) return false
    return true
  }

  export function getSlotChild (slotRootElt: Element, child: 'inner' | 'styles' | 'content') {
    const querryableRoot = slotIsIsolated(slotRootElt)
      ? slotRootElt.querySelector(`.${appConfig.slots.shadowElementClass}`)?.shadowRoot
      : slotRootElt.querySelector(`.${appConfig.slots.lightElementClass}`)
    if (child === 'inner') return querryableRoot?.querySelector(`.${appConfig.slots.innerElementClass}`) ?? null
    if (child === 'styles') return querryableRoot?.querySelector(`.${appConfig.slots.styleElementClass}`) ?? null
    return querryableRoot?.querySelector(`.${appConfig.slots.contentElementClass}`) ?? null
  }

  export function refreshSlotsIsolation () {
    created.forEach(slotRootElt => {
      const isIsolated = slotIsIsolated(slotRootElt)
      const shadowElt = slotRootElt.querySelector(`.${appConfig.slots.shadowElementClass}`)
      const lightElt = slotRootElt.querySelector(`.${appConfig.slots.lightElementClass}`)
      const innerElt = getSlotChild(slotRootElt, 'inner')
      innerElt?.remove()
      if (innerElt === null) return;
      if (isolationMode) {
        if (isIsolated) return;
        const shadow = shadowElt?.shadowRoot ?? shadowElt?.attachShadow({ mode: 'open' })
        shadow?.appendChild(innerElt)
      } else {
        if (!isIsolated) return;
        lightElt?.append(innerElt)
      }
    })
  }
}
