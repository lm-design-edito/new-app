import { Darkdouille } from '../..'
import clone from '../clone'
import toHtml from '../toHtml'

const asDkdll = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> => () => {
  const returned: Darkdouille.Transformer<Darkdouille.TreeValue> = (inputValue) => {
    if (!(inputValue instanceof NodeList)) return inputValue
    const thisTree = resolve('.')
    const htmlValue = toHtml()(clone()(inputValue))
    const elements = Array.from(htmlValue).filter((node): node is Element => node instanceof Element)
    if (elements.length === 0) return undefined
    const rootElement = document.createElement('div')
    rootElement.append(...htmlValue)
    const tree = Darkdouille.tree([rootElement], thisTree)
    const value = tree.value
    return value
  }
  return returned
}

export default asDkdll
