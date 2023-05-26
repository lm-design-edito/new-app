import { toString } from '../cast'

export default function selectorToElement (selector: string) {
  const selectorTag = selector.match(/^.*?(?=[#|\.|\/[]|$)/)
  const tag = selectorTag && selectorTag[0] ? selectorTag[0] : 'div'
  const element = document.createElement(tag)
  selector.split(/(?=[#|.[])/).forEach(_attribute => {
    try {
      const attribute = _attribute.trim()
      const isClassAttr = attribute.includes('.')
      const isIdAttr = attribute.includes('#')
      const isOtherAttr = attribute.includes('[')
      if (isClassAttr) element.classList.add(attribute.replace('.', ''))
      else if (isIdAttr) element.setAttribute('id', attribute.replace('#', ''))
      else if (isOtherAttr) {
        const keyValueAttribute = attribute.match(/(?!\[).+(?<!\])/)
        if (keyValueAttribute && keyValueAttribute.length) {
          const [key, value = ''] = keyValueAttribute[0]
            .replace(/["']/gm, '')
            .split('=')
          if (key) element.setAttribute(toString(key), toString(value))
        }
      }
    } catch(e) {
      console.log('ERR selectorToElement', e)
    }
  })
  return element
}
