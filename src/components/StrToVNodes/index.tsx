import { Component, JSX, VNode } from 'preact'
import strToNodes from '../../utils/str-to-nodes'
import nodesToVNodes from '../../utils/nodes-to-vnodes'
import { Options as SanitizeOptions } from '../../utils/clientside-html-sanitizer'

type Props = {
  content?: string
  sanitize?: SanitizeOptions|false
}

const { hostname, search } = window.location
const hostnameIsProd = hostname === 'lemonde.fr' || hostname === 'www.lemonde.fr'
const explicitSanitizeSearchQuery = search.match(/lm_verbose_sanitize=true/) !== null
const verboseSanitize = explicitSanitizeSearchQuery || !hostnameIsProd

const defaultSanitizeOptions: SanitizeOptions = {
  inputFreeTransform: input => {
    const uriAllowedCharacters = `[a-z0-9\\-\\.\\_\\~\\:\\/\\?\\#\\[\\]\\@\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]`
    const looksLikeUrlPattern = new RegExp(`${uriAllowedCharacters}*:\/\/${uriAllowedCharacters}+`, 'igm') // [WIP] could do better?
    const looksLikeUrlMatches = input.match(looksLikeUrlPattern)
    if (looksLikeUrlMatches === null) return input
    let returned = input
    looksLikeUrlMatches.forEach(match => {
      const matchProtocol = match.match(new RegExp(`${uriAllowedCharacters}*:\/\/`, 'igm'))
      if (matchProtocol === null) {
        if (verboseSanitize) console.warn('Stripped non-https URL pattern:', match)
        // [WIP] replaceAll is not part of ES2020, should find a workaround
        returned = returned.replaceAll(match, '')
        return
      }
      const matchProtocolIsHttps = matchProtocol.every(matchedProtocol => matchedProtocol.match(/^https:\/\/$/))
      if (!matchProtocolIsHttps) {
        if (verboseSanitize) console.warn('Stripped non-https URL pattern:', match)
        returned = returned.replaceAll(match, '')
        return
      }
      const isLemondeUrl = match.match(/^https\:\/\/lemonde\.fr/) !== null
      const isWwwLemondeUrl = match.match(/^https\:\/\/www\.lemonde\.fr/) !== null
      const isAssetsUrl = match.match(/^https\:\/\/assets-decodeurs\.lemonde\.fr/) !== null
      const isImgLemdeUrl = match.match(/^https\:\/\/img\.lemde\.fr/) !== null
      const isVimeo = match.match(/^https\:\/\/player\.vimeo\.com/) !== null
      const urlIsAllowed = isLemondeUrl || isWwwLemondeUrl || isAssetsUrl || isImgLemdeUrl || isVimeo
      if (!urlIsAllowed) {
        if (verboseSanitize) console.warn('Stripped forbidden URL host:', match)
        returned = returned.replaceAll(match, '')
      }
    })
    return returned
  },
  allowedTags: ['a', 'article', 'aside', 'audio', 'blockquote', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'div', 'em', 'embed', 'figcaption', 'figure', 'footer', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'img', 'label', 'legend', 'li', 'main', 'nav', 'ol', 'p', 'path', 'picture', 'pre', 'section', 'source', 'span', 'strong', 'style', 'sub', 'sup', 'svg', 'ul', 'video', 'wbr'],
  allowedAttributes: {
    '*': [
      ...['alt', /^aria/, 'autoplay', 'cite', 'class', 'code', 'codebase', 'contenteditable', 'contextmenu', 'controls', 'coords', 'data', /^data/, 'datetime', 'decoding', 'default', 'dir', 'disabled', 'draggable', 'for', 'headers', 'hidden', 'high', 'importance', 'intrinsicsize', 'ismap', /^item/, 'kind', 'label', 'lang', 'loading', 'loop', 'low', 'max', 'media', 'min', 'multiple', 'muted', 'name', 'open', 'optimum', 'playsinline', 'preload', 'reversed', 'role', 'rowspan', 'scope', 'shape', 'sizes', 'slot', 'span', 'spellcheck', 'start', 'style', 'summary', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'value']
        .map(vld => ({ attributeName: vld })),
      ...[{
        attributeName: /^(href|src|poster)$/,
        attributeValues: [
          /^https:\/\/lemonde\.fr/,
          /^https:\/\/www\.lemonde\.fr/,
          /^https:\/\/assets-decodeurs\.lemonde\.fr/,
          /^https:\/\/img\.lemde\.fr/,
          /^https:\/\/player\.vimeo\.com/,
          /^\s*$/
        ]
      }]
    ],
    // [WIP] do better for svg tags and attributes
    'svg': [{ attributeName: /^(view(b|B)ox|fill|fill\-rule|clip\-rule)$/ }],
    'path': [{ attributeName: /^(stroke|stroke\-width|fill|d|fill\-rule|clip\-rule|stroke\-dasharray)$/ }]
  },
  forbiddenTags: ['doctype', 'html', 'head', 'meta', 'body', 'script', 'link', 'iframe', 'object', 'applet', 'embed', 'form'],
  forbiddenAttributes: { '*': [{ attributeName: /^on/ } ] },
  verbose: verboseSanitize
}

type State = {
  content?: string
  vNodes: VNode[]
}

class StrToVNode extends Component<Props, State> {
  state: State = {
    content: undefined,
    vNodes: []
  }
  
  static getDerivedStateFromProps(props: Props, state: State): State|null {
    const { content, sanitize } = props
    if (content === state.content) return null
    if (content === undefined) return { ...state, vNodes: [] }
    const nodes = strToNodes(content, {
      sanitize: sanitize !== false
        ? sanitize ?? defaultSanitizeOptions
        : undefined
    })
    const vNodes = nodesToVNodes(nodes)
    return {
      ...state,
      content: content,
      vNodes
    }
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|string {
    return <>{this.state.vNodes}</>
  }
}

export type { Props }
export default StrToVNode
