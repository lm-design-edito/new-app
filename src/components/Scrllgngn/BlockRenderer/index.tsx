import { Component, VNode } from 'preact'
import ModuleRenderer from './ModuleBlockRenderer/index.js'
import { ModuleBlockContext } from '../index.js'
import HtmlBlockRenderer from './HtmlBlockRenderer/index.js'

type Props = {
  type?: 'module' | 'html'
  content?: string | VNode
  context?: ModuleBlockContext
  injectStylesheet?: (url: string) => void
  injectCss?: (css: string) => void
}

export default class BlockRenderer extends Component<Props> {
  render() {
    const { props } = this
    const { type, content, context, injectStylesheet, injectCss } = props
    switch (type) {
      case 'html':
      case undefined: return <HtmlBlockRenderer content={content} />
      case 'module': return <ModuleRenderer
        url={typeof content === 'string' ? content : ''}
        context={context}
        injectStylesheet={injectStylesheet}
        injectCss={injectCss} />
      default: return <></>
    }
  }
}
