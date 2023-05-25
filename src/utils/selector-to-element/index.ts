import { toString } from "../cast";

const toValidAttributeString = (string: string) => {
  return string.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
}

export default function selectorToElement (selector: string) {
  const selectorTag = selector.match(/^.*?(?=[#|\.|\/[]|$)/)
  const tag = selectorTag && selectorTag[0] ? selectorTag[0] : 'div'
  const element = document.createElement(tag)

  selector.split(/(?=[#|.[])/).forEach((attribute) => {
    const _attribute = attribute.trim();
    if (_attribute.includes('.')) {
      element.classList.add(toValidAttributeString(_attribute))
    } else if (_attribute.includes('#')) {
      element.setAttribute('id', toValidAttributeString(_attribute));
    } else if (_attribute.includes('[')) {
      const keyValueAttribute = _attribute.match(/(?!\[).+(?<!\])/);
      if (keyValueAttribute && keyValueAttribute.length) {
        const [key, value = ''] = keyValueAttribute[0].split('=');
        if (key) {
          element.setAttribute(toValidAttributeString(toString(key)), toValidAttributeString(toString(value)));
        }
      }
    }
  });
  return element;
}
