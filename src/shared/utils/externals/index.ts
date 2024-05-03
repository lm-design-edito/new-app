import getNodeAncestors from '~/utils/get-node-ancestors'

export namespace Externals {

  type SiteGlobalObj = {
    isAec: boolean | undefined
    lang: 'fr' | 'en' | undefined
  }

  export function getSiteGlobalObj (): SiteGlobalObj {
    return (window as any).lmd ?? {}
  }
  
  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Page ID attribute
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export const pageIdAttribute = 'data-lm-page-id'
  export const setPageIdAttribute = (id: string) => document.body.setAttribute(pageIdAttribute, id)

  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - Platform (website | AEC) detection
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export const leMondeAecHrefRegexp = /apps.([a-z]+\-)?lemonde.(fr|io)/
  export const leMondeWebsiteHrefRegexp = /www.lemonde.fr/
  export const isLeMondeAecViaHref = () => window.location.href.match(leMondeAecHrefRegexp)
  export const isLeMondeAecViaGlobalVar = () => getSiteGlobalObj().isAec
  export const isLeMondeAec = () => isLeMondeAecViaHref() || isLeMondeAecViaGlobalVar()
  export const isLeMondeWebsite = () => window.location.href.match(leMondeWebsiteHrefRegexp)
  export const getPlatform = () => {
    if (isLeMondeAec()) return 'aec'
    if (isLeMondeWebsite()) return 'website'
    return 'unknown'
  }
  export const platformAttribute = 'data-lm-platform'
  export const setPlatformAttribute = (...elts: Element[]) => elts.forEach(elt => elt.setAttribute(platformAttribute, getPlatform()))

  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - Edition (fr | en) detection
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export const isLeMondeInFrench = () => getSiteGlobalObj().lang === 'fr'
  export const isLeMondeInEnglish = () => getSiteGlobalObj().lang === 'en'
  export const getEdition = () => {
    if (isLeMondeInFrench()) return 'fr'
    if (isLeMondeInEnglish()) return 'en'
    return 'unknown'
  }
  export const editionAttribute = 'data-lm-edition'
  export const setEditionAttribute = (...elts: Element[]) => elts.forEach(elt => elt.setAttribute(editionAttribute, getEdition()))

  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - Color mode
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export const leMondeColorAttributeName = 'data-color-mode'
  export const hasLeMondeColorModeAttribute = (node: Node): node is Element => node instanceof Element
    ? node.getAttribute(leMondeColorAttributeName) !== null
    : false
  export const getLeMondeColorModeContext = (node: Node) => {
    const ancestors = getNodeAncestors(node, true)
    const firstThemedTargetAncestor = ancestors.find(hasLeMondeColorModeAttribute)
    if (firstThemedTargetAncestor === undefined) return null
    const colorMode = firstThemedTargetAncestor.getAttribute(leMondeColorAttributeName)
    return colorMode
  }
  export const setColorModeContextAttribute = (...elts: Element[]) => {
    elts.forEach(elt => {
      const colorMode = getLeMondeColorModeContext(elt)
      if (colorMode !== null) elt.setAttribute(Externals.leMondeColorAttributeName, colorMode)
    })  
  }
  
  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - Snippets
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  export const leMondeSnippetClassName = 'multimedia-embed'
  export const isLeMondeSnippetWrapper = (node: Node): node is Element => node instanceof Element
    ? node.classList.contains(leMondeSnippetClassName)
    : false
  export const getSnippetParent = (elt: Element) => {
    const ancestors = getNodeAncestors(elt, true)
    return ancestors.find(isLeMondeSnippetWrapper)
  }
  export const snippetWrapperAttribute = 'data-lm-snippet'
  export const snippetChildAttribute = 'data-lm-snippet-child'
  export const setParentSnippetAttribute = (...elts: Element[]) => {
    elts.forEach(elt => {
      const snippetParent = getSnippetParent(elt)
      // [WIP] or get all snippet parents ?
      if (snippetParent === undefined) return
      snippetParent.setAttribute(snippetWrapperAttribute, '')
      elt.setAttribute(snippetChildAttribute, '')
    })
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - Header
   * 
   * * * * * * * * * * * * * * * * * * * * * */

  function getLeMondeHeaderInVisuelInteractifTemplate () {
    const header = document.querySelector('header.multimediaNav')
    return header !== null ? [header] : null
  }
  
  function getLeMondeHeaderInVideoTemplate () {
    const header = document.querySelector('div#Header.old__header')
    const nav = document.querySelector('div.Header__nav-container')
    const returned = []
    if (header !== null) returned.push(header)
    if (nav !== null) returned.push(nav)
    if (returned.length === 0) return null
    return returned
  }
  
  // function getLeMondeHeaderInLiveTemplate () { return getLeMondeHeaderInVideoTemplate() }
  // function getLeMondeHeaderInPortfolioTemplate () { return getLeMondeHeaderInVideoTemplate() }
  // function getLeMondeHeaderInArticleTemplate () { return getLeMondeHeaderInVideoTemplate() }
  // function getLeMondeHeaderInLargeArticleTemplate () { return getLeMondeHeaderInVideoTemplate() }

  export function getLeMondeHeaderElements () {
    const fromVisuelInteractif = getLeMondeHeaderInVisuelInteractifTemplate()
    const fromOtherTemplates = getLeMondeHeaderInVideoTemplate() // no need to call all the functions since they are all the same
    const returned = []
    if (fromVisuelInteractif !== null) returned.push(...fromVisuelInteractif)
    if (fromOtherTemplates !== null) returned.push(...fromOtherTemplates)
    if (returned.length === 0) return null
    return returned
  }

  export function setLeMondeHeaderVisibility (visibility: boolean) {
    const headerElements = getLeMondeHeaderElements() ?? []
    headerElements.forEach(elt => {
      const element = elt as HTMLElement
      if (!visibility) {
        element.style.opacity = ''
        element.style.visibility = ''
        element.style.display = ''
        element.style.pointerEvents = ''
        element.style.userSelect = ''
      } else {
        element.style.opacity = '0'
        element.style.visibility = 'collapse'
        element.style.display = 'none'
        element.style.pointerEvents = 'none'
        element.style.userSelect = 'none'
      }
    })
  }

  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * Le Monde - [WIP] Analytics stuff should probably be here too
   * 
   * * * * * * * * * * * * * * * * * * * * * */
}
