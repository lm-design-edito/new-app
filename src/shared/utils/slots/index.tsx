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

  export enum StylePosition {
    HEAD_ONLY = -1000,
    HEAD = 0,
    STRUCTURAL = 1000,
    COMPONENTS = 2000,
    SCALES = 3000,
    CUSTOM = 9999
  }

  export const stylePositionNameMap = new Map<string, StylePosition>([
    ['head-only', StylePosition.HEAD_ONLY],
    ['head', StylePosition.HEAD],
    ['structural', StylePosition.STRUCTURAL],
    ['scales', StylePosition.SCALES],
    ['custom', StylePosition.CUSTOM]
  ])

  type StyleData = {
    id: string
    type: 'url' | 'css'
    content: string
    name?: string
    position: number
    details?: string
  }

  export const styles = new Set<StyleData>()

  type InjectStylesOptions = {
    name?: string,
    position?: number
    details?: string
  }

  export function injectStyles (
    as: 'url' | 'css',
    content: string,
    options: InjectStylesOptions = {}) {
    const { name, position = StylePosition.CUSTOM, details } = options
    const exists = [...styles].find(item => (item.type === as
      && item.content === content
      && item.name === name))
    const id = randomUUID().split('-')[0] ?? ''
    if (exists !== undefined) return
    styles.add({ id, type: as, content, name, position, details })
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

  export function getStylesElementFromHead () {
    const found = document.head.querySelector(`.${appConfig.slots.headStylesElementClass}`)
    if (found !== null) return found
    const created = document.createElement('div')
    created.classList.add(appConfig.slots.headStylesElementClass)
    document.head.append(created)
    return created
  }

  export function styleDataToVNode (styleData: StyleData) {
    if (styleData.type === 'css') return <style
      name={styleData.name}
      data-lm-id={styleData.id}
      data-lm-position={styleData.position}
      data-lm-details={styleData.details}>
      {styleData.content}
    </style>
    return <link
      name={styleData.name}
      data-lm-id={styleData.id}
      data-lm-position={styleData.position}
      data-lm-details={styleData.details}
      rel='stylesheet'
      href={styleData.content} />
  }

  export function refreshStyles () {
    const [headStylesData, slotsStylesData] = Array.from(styles).reduce((reduced, styleData) => {
      const [forHead, forSlots] = reduced
      if (!isolationMode) return [[...forHead, styleData], []]
      if (styleData.position < 0) return [[...forHead, styleData], forSlots]
      if (styleData.position === 0) return [[...forHead, styleData], [...forSlots, styleData]]
      return [forHead, [...forSlots, styleData]]
    }, [[], []] as [StyleData[], StyleData[]])
    // Render in head
    preactRender(<>{headStylesData
      .sort((a, b) => a.position - b.position)
      .map(styleDataToVNode)
    }</>, getStylesElementFromHead())
    // Render in slots
    created.forEach(slotRootElt => {
      const stylesElt = getSlotChild(slotRootElt, 'styles')
      if (stylesElt === null) return;
      preactRender(<>{slotsStylesData
        .sort((a, b) => a.position - b.position)
        .map(styleDataToVNode)
      }</>, stylesElt)
    })
  }

  export function makeSlot (slotRootElt: Element, content: VNode[] | string): Element | undefined {
    if (created.has(slotRootElt)) return;
    slotRootElt.classList.add(appConfig.slots.rootElementClass)
        
    const classes = {
      style: appConfig.slots.styleElementClass,
      content: appConfig.slots.contentElementClass,
      inner: appConfig.slots.innerElementClass,
      shadow: appConfig.slots.shadowElementClass,
      light: appConfig.slots.lightElementClass
    }

    // Create styles element
    const stylesElt = document.createElement('div')
    stylesElt.classList.add(classes.style)

    // Create content element
    const contentElt = document.createElement('div')
    contentElt.classList.add(classes.content)
    preactRender(<>{content}</>, contentElt)

    // Create slot inner element
    const innerElt = document.createElement('div')
    innerElt.classList.add(classes.inner)
    innerElt.append(stylesElt, contentElt)

    // Create shadow and light elements
    const shadowElt = document.createElement('div')
    const lightElt = document.createElement('div')
    shadowElt.classList.add(classes.shadow)
    lightElt.classList.add(classes.light)
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
    Externals.setPlatformAttribute(innerElt, slotRootElt)
    Externals.setEditionAttribute(innerElt, slotRootElt)
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
