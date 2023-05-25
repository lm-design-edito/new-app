import { toString } from "../cast";

export default function selectorToElement (selector: string) {
  const selectorTag = selector.match(/^.*?(?=[#|\.|\/[]|$)/)
  const tag = selectorTag && selectorTag[0] ? selectorTag[0] : 'div'
  const element = document.createElement(tag)

  selector.split(/(?=[#|.[])/).forEach((attribute) => {
    try {
      const _attribute = attribute.trim();
      if (_attribute.includes('.')) {
        element.classList.add(_attribute.replace('.', ''))
      } else if (_attribute.includes('#')) {
        element.setAttribute('id', _attribute.replace('#', ''));
      } else if (_attribute.includes('[')) {
        const keyValueAttribute = _attribute.match(/(?!\[).+(?<!\])/);
        if (keyValueAttribute && keyValueAttribute.length) {
          const [key, value = ''] = keyValueAttribute[0].replace(/["']/gm, '').split('=');
          if (key) {
            element.setAttribute(toString(key), toString(value));
          }
        }
      }
    } catch(e) {
      console.log('ERR selectorToElement', e)
    }
  });
  return element;
}
