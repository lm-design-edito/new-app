const rulesMap: Map<string, string> = new Map()

export function injectCssRule (rule: string, force?: boolean): string
export function injectCssRule (rule: string, name: string, force?: boolean): string
export function injectCssRule (rule: string, _forceOrName?: boolean|string, _force?: boolean): string {
  const name = typeof _forceOrName === 'string' ? _forceOrName : rule
  const force = _forceOrName === true || _force === true
  const alreadyInMap = rulesMap.get(name)
  const shouldInject = force === true || alreadyInMap === undefined
  if (!shouldInject) return name
  rulesMap.set(name, rule)
  updateStyleElements()
  return name
}

export function removeCssRule (name: string) {
  const deleted = rulesMap.delete(name)
  if (deleted) updateStyleElements()
}

function updateStyleElements () {
  // Remove unused style tags
  const styleTagsClass = '__dynamic-styles'
  const allStylesTags = [...document.querySelectorAll(`.${styleTagsClass}`)]
  allStylesTags.forEach(styleTag => {
    const dataName = styleTag.getAttribute('data-name')
    if (dataName === null) return styleTag.remove()
    const matchingRule = rulesMap.get(dataName)
    if (matchingRule === undefined) return styleTag.remove()
  })
    
  // Update style tags
  rulesMap.forEach((rule, name) => {
    const dataName = name.replace(/[^\w]/igm, '')
    const existingTag = document.querySelector(`.${styleTagsClass}[data-name="${dataName}"]`)
    const targetCssValue = `/* ${name.replace(/[^\w]/, '-')} */\n${rule}`
    if (existingTag !== null) {
      existingTag.innerHTML = targetCssValue
    } else {
      const targetTag = document.createElement('style')
      targetTag.classList.add(styleTagsClass)
      targetTag.setAttribute('data-name', dataName)
      targetTag.innerHTML = targetCssValue
      document.head.append(targetTag)
    }
  })
}

export function injectStylesheet (href: string, onLoad?: (event?: Event) => void, targetSelector?: string) {
  const target = targetSelector !== undefined
    ? (document.querySelector(targetSelector) ?? document.head)
    : document.head
  const link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('href', href)
  if (onLoad !== undefined) link.addEventListener('load', onLoad)
  target.appendChild(link)
  return link
}
