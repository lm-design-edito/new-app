import { Component } from 'preact'

export type Props = {
  url?: string
  customClass?: string
}

export default class ReadInEnglish extends Component<Props> {
  render () {
    const { url, customClass, children } = this.props
    const clsses = ['lm-article-read-in-english']
    if (customClass !== undefined) clsses.push(customClass)
    return <a
      href={url}
      className={clsses.join(' ')}>
      {children !== undefined ? children : 'Read in English'}
    </a>
  }
}
