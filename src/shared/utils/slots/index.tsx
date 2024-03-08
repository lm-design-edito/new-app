import { render as preactRender, VNode } from 'preact'
import { Externals } from '~/shared/externals'
import randomUUID from '~/utils/random-uuid'

export namespace Slots {
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
    const found = [...Slots.styles].find(styleData => styleData.name === name)
    if (found === undefined) return;
    Slots.styles.delete(found)
    Slots.refreshStyles()
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

  export function refreshStyles () {
    created.forEach(slotElement => {
      const shadow = slotElement.shadowRoot
      const stylesElt = shadow?.querySelector('.lm-slot__styles') ?? undefined      
      if (stylesElt === undefined) return;
      renderStylesInTarget(stylesElt)
    })
  }

  export function makeSlot (slotRootElt: Element, content: VNode[] | string): Element | undefined {
    if (created.has(slotRootElt)) return;
    slotRootElt.classList.add('lm-slot')

    // Create styles element
    const stylesElt = document.createElement('div')
    stylesElt.classList.add('lm-slot-inner__styles')
    renderStylesInTarget(stylesElt)

    // Create content element
    const contentElt = document.createElement('div')
    contentElt.classList.add('lm-slot-inner__content')
    preactRender(<>{content}</>, contentElt)

    // Create slot inner element
    const innerElt = document.createElement('div')
    innerElt.classList.add('lm-slot-inner')
    innerElt.append(stylesElt, contentElt)

    // Create shadow
    const shadow = slotRootElt.attachShadow({ mode: 'open' })
    shadow.append(innerElt)
    created.add(slotRootElt)

    // External context detection
    Externals.setDeviceContextAttribute(innerElt)
    Externals.setColorModeContextAttribute(innerElt)
    Externals.setParentSnippetAttribute(innerElt)

    return contentElt
  }
}
