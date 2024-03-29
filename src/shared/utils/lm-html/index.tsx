import { VNode, createElement } from 'preact'
import { Darkdouille } from '~/shared/darkdouille'
import { Globals } from '~/shared/globals'
import { Apps } from '~/apps'
import isInEnum from '~/utils/is-in-enum'
import MutedVideo from './MutedVideo'

export namespace LmHtml {
  export const boolAttrNames = [
    'allowfullscreen',      'async',          'autofocus',      'autoplay',
    'checked',              'controls',       'default',        'defer',
    'disabled',             'formnovalidate', 'inert',          'ismap',
    'itemscope',            'loop',           'multiple',       'muted',
    'nomodule',             'novalidate',     'open',           'playsinline',
    'readonly',             'required',       'reversed',       'selected'
  ]

  export async function render (node: Node): Promise<VNode> {
    const { nodeType } = node
    if (nodeType === Node.ELEMENT_NODE) return await elementToVNode(node as Element)
    if (nodeType === Node.TEXT_NODE) return <>{(node as Text).wholeText}</>
    return <></>
  }

  async function elementToVNode (element: Element): Promise<VNode> {
    const { tagName: tagNameInAnyCase, attributes, childNodes } = element
    const tagName = tagNameInAnyCase.toLowerCase()
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)

    // If tagname is comp
    // [WIP] tag name configurable in ~/config ?
    const isCustomComp = tagName === 'comp'
    if (isCustomComp) {
      const appName = element.getAttribute('name') ?? ''
      const appId = element.getAttribute('compid')
      const typeIsValidAppName = isInEnum(Apps.Name, appName)
      const unknownPropsTree = Darkdouille.tree([element])
      const unknownProps = unknownPropsTree.value
      if (typeIsValidAppName) return await Apps.render(appName, appId, unknownProps)
      logger?.warn('Render', '%cInvalid app name', 'font-weight: 800;', 'at', element)
      return <></>
    }

    const attributesProps: { [key: string]: string | boolean } = [...attributes].reduce((acc, curr) => {
      const attrShouldBeBoolean = boolAttrNames.includes(curr.name)
      return { ...acc, [curr.name]: attrShouldBeBoolean ? true : curr.value }
    }, {})
    const children = await Promise.all([...childNodes].map(node => render(node)))
  
    // If muted video
    const isVideo = tagName === 'video'
    const isMuted = attributes.getNamedItem('muted') !== null
    if (isVideo && isMuted) return <MutedVideo {...attributesProps}>{children}</MutedVideo>
  
    // Any other case
    const vNode = createElement(tagName.toLowerCase(), { ...attributesProps }, children)
    return vNode
  }  
}
