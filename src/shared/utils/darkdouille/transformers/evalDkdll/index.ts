import { Darkdouille } from '../..'
import clone from '../clone'
import toHtml from '../toHtml'

const evalDkdll = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> => () => {
  const returned: Darkdouille.Transformer<Darkdouille.TreeValue> = (inputValue) => {
    const thisTree = resolve('.')
    const htmlValue = toHtml()(clone()(inputValue))
    const elements = Array.from(htmlValue).filter((node): node is Element => node instanceof Element)
    if (elements.length === 0) return {}
    const rootElement = elements.length === 1 ? elements[0] as Element : document.createElement('div')
    if (elements.length > 1) rootElement.append(...htmlValue)
    const tree = Darkdouille.tree([rootElement], thisTree)
    const value = tree.value
    return value
  }
  return returned
}

export default evalDkdll
