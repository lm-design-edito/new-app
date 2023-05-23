import { Component } from 'preact'

export type Props = {
  url?: string
}

export default class ReadInEnglish extends Component<Props> {
  render () {
    return <a
      href={this.props.url}
      className='lm-article-read-in-english'>
      Read in English
    </a>
  }
}
