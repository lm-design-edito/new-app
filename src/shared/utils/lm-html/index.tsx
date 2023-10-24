import { VNode, createElement } from 'preact'
import { Darkdouille } from '~/shared/darkdouille'
import Logger from '~/utils/silent-log'
import MutedVideo from './MutedVideo'
import { Apps } from '~/apps'

export const boolAttrNames = [
  'allowfullscreen',      'async',          'autofocus',      'autoplay',
  'checked',              'controls',       'default',        'defer',
  'disabled',             'formnovalidate', 'inert',          'ismap',
  'itemscope',            'loop',           'multiple',       'muted',
  'nomodule',             'novalidate',     'open',           'playsinline',
  'readonly',             'required',       'reversed',       'selected'
]

export default async function render (node: Node, logger?: Logger): Promise<VNode> {
  const { nodeType } = node
  if (nodeType === Node.ELEMENT_NODE) return await elementToVNode(node as Element, logger)
  if (nodeType === Node.TEXT_NODE) return <>{(node as Text).wholeText}</>
  return <></>
}

async function elementToVNode (element: Element, logger?: Logger): Promise<VNode> {
  const { tagName: tagNameInAnyCase, attributes, childNodes } = element
  const tagName = tagNameInAnyCase.toLowerCase()

  // If tagname is comp
  const isCustomComp = tagName === 'comp'
  if (isCustomComp) {
    const appName = element.getAttribute('type') ?? ''
    const typeIsValidAppName = Apps.isValidName(appName)
    const unknownProps = Darkdouille.tree(element).value
    if (typeIsValidAppName) {
      // Log here
      return await Apps.render(appName, unknownProps, logger)
    }
    // Log here
    return <></>;
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
