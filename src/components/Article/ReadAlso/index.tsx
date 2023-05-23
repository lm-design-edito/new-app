import { Component } from 'preact'

export type Props = {
  url?: string
}

export default class ReadAlso extends Component<Props> {
  render () {
    return <a
      className='lm-article-read-also'
      href={this.props.url}>
      {this.props.children}
    </a>
  }
}
