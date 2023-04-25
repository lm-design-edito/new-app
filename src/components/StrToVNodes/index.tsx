import { Component, JSX, VNode } from 'preact'
import strToNodes from '~/utils/str-to-nodes'
import nodesToVNodes from '~/utils/nodes-to-vnodes'
import { Options as SanitizeOptions } from '~/utils/clientside-html-sanitizer'
import defaultSanitizeOptions from './sanitizeOptions'

type Props = {
  content?: string
  sanitize?: SanitizeOptions|false
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
