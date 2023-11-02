import { Component, VNode } from 'preact'
import bem from '~/utils/bem'

export type Props = {
  url?: string
  label?: string|VNode
  subscribed?: boolean
  customClass?: string
}

export default class ReadAlso extends Component<Props> {
  render () {
    const { url, subscribed, label, customClass, children } = this.props
    const clss = bem('lm-article-read-also').mod({ subscribed })
    const labelClss = clss.elt('label')
    const titleClss = clss.elt('title')
    const clsses = [clss.value]
    if (customClass !== undefined) clsses.push(customClass)
    return <a className={clsses.join(' ')} href={url}>
      {label !== '' && <span className={labelClss.value}>
        {label !== undefined ? label : 'Lire aussi'}
      </span>}
      <span className={titleClss.value}>{children}</span>
    </a>
  }
}
