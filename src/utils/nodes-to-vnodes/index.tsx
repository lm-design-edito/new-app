import { VNode, createElement } from 'preact'
import MutedVideo from './MutedVideo'

export default function nodesToVNodes (inputNodes: Node|Node[]): VNode[] {
  const nodes = Array.isArray(inputNodes) ? inputNodes : [inputNodes]
  const vNodes = nodes.map(node => nodeToVNode(node))
  return vNodes
}

export const boolAttrNames = [
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected'
]

function nodeToVNode (node: Node): VNode {
  const { nodeType } = node
  if (nodeType === Node.ELEMENT_NODE) return elementToVNode(node as Element)
  if (nodeType === Node.TEXT_NODE) return <>{(node as Text).wholeText}</>
  return <></>
}

function elementToVNode (element: Element): VNode {
  const { tagName: tagNameInAnyCase, attributes, childNodes } = element
  const tagName = tagNameInAnyCase.toLowerCase()
  const attributesProps: { [key: string]: string | boolean } = [...attributes].reduce((acc, curr) => {
    const attrShouldBeBoolean = boolAttrNames.includes(curr.name)
    return {
      ...acc,
      [curr.name]: attrShouldBeBoolean
        ? true
        : curr.value
    }
  }, {})
  const children = [...childNodes].map(node => nodeToVNode(node))

  // If muted video
  const isVideo = tagName === 'video'
  const isMuted = attributes.getNamedItem('muted') !== null
  if (isVideo && isMuted) return <MutedVideo {...attributesProps}>
    {children}
  </MutedVideo>

  // Any other case
  const vNode = createElement(
    tagName.toLowerCase(),
    { ...attributesProps },
    children
  )
  return vNode
}
