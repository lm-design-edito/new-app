import { Component, isValidElement, VNode } from 'preact'
import StrToVNode from '~/components/StrToVNodes'

type Props = {
  content?: string|VNode
}

export default class HtmlBlockRenderer extends Component<Props> {
  render () {
    const { content } = this.props
    if (isValidElement(content)) return content
    return content !== undefined ? <StrToVNode content={content} /> : null
  }
}
