import strToNodes from '~/utils/str-to-nodes'
import { makeTransformer } from '../..'
import { TransformerType } from '../../types'
import toString from '../toString'

export default makeTransformer(
  'toHtml',
  TransformerType.ONE_TO_ONE,
  value => {
    const strValue = toString.apply(value, '')
    if (typeof strValue === 'string') {
      const nodes = strToNodes(strValue)
      if (nodes.length === 1 && nodes[0] instanceof HTMLElement) {
        return nodes[0]
      } else {
        const div = document.createElement('div')
        nodes.forEach(node => div.appendChild(node))
        return div
      }
    }
    return value
  }
)

// [WIP] make toVNode transformer
