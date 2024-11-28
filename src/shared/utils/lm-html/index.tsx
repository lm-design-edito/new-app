import { VNode, createElement } from 'preact'
import { isInEnum } from '@design-edito/tools/agnostic/objects/enums/is-in-enum'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { HyperJson } from '~/shared/hyper-json'
import { Globals } from '~/shared/globals'
import { Apps } from '~/apps'
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

  export async function render (nodeOrNodeList: Node | NodeList): Promise<VNode> {
    if (nodeOrNodeList instanceof NodeList) {
      const rendered = await Promise.all(Array.from(nodeOrNodeList).map(n => render(n)))
      return <>{...rendered}</>
    }
    const { nodeType } = nodeOrNodeList
    if (nodeType === Node.ELEMENT_NODE) return await elementToVNode(nodeOrNodeList as Element)
    if (nodeType === Node.TEXT_NODE) return <>{(nodeOrNodeList as Text).textContent}</>
    return <></>
  }

  async function elementToVNode (element: Element): Promise<VNode> {
    const { tagName: tagNameInAnyCase, attributes, childNodes } = element
    const tagName = tagNameInAnyCase.toLowerCase()
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    const elementIsRecord = tagName === 'record'
    const elementForAttribute = element.getAttribute('_for')?.trim().toLowerCase() 
    if (elementIsRecord
      && elementForAttribute !== undefined
      && isInEnum(Apps.Name, elementForAttribute)) {
      const cloned = HyperJson.Utils.clone(element)
      cloned.removeAttribute('_literal')
      cloned.removeAttribute('_preserve')
      const evaluated = HyperJson.Tree.Tree.from([cloned], {
        globalObject: Globals.getHyperJsonGlobalObj(),
        logger: Globals.retrieve(Globals.GlobalKey.LOGGER) ?? null,
        loggerThread: 'Render'
      }).evaluate()
      if (!isRecord(evaluated)) {
        logger?.warn('Render', '%App configuration object must be a record', 'font-weight: 800;', 'at', element, 'found', evaluated)
        return <></>
      }
      const appId = cloned.getAttribute('_id')
      const appName = elementForAttribute
      return await Apps.render(appName as Apps.Name, appId, evaluated)
    }

    const children = await Promise.all([...childNodes].map(node => render(node)))
    const attributesProps: { [key: string]: string | boolean } = [...attributes].reduce((acc, curr) => {
      const attrShouldBeBoolean = boolAttrNames.includes(curr.name)
      return { ...acc, [curr.name]: attrShouldBeBoolean ? true : curr.value }
    }, {})

    // If muted video
    const isVideo = tagName === 'video'
    const isMuted = attributes.getNamedItem('muted') !== null
    if (isVideo && isMuted) return <MutedVideo {...attributesProps}>{children}</MutedVideo>
  
    // Any other case
    const vNode = createElement(tagName.toLowerCase(), { ...attributesProps }, children)
    return vNode
  }  
}
