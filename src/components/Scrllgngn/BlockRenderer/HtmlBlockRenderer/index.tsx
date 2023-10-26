import { Component, VNode } from 'preact'

type Props = { content?: string | VNode }

export default class HtmlBlockRenderer extends Component<Props> {
  render () {
    const { content } = this.props
    return content ?? null
  }
}
