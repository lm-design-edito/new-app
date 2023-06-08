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

export async function injectStylesheet (url: string|URL, force?: boolean): Promise<string|Error>
export async function injectStylesheet (url: string|URL, name: string, force?: boolean): Promise<string|Error>
export async function injectStylesheet (
  url: string|URL,
  _forceOrName?: boolean|string,
  _force?: boolean): Promise<string|Error> {
  try {
    const urlStr = url instanceof URL ? url.toString() : url
    const response = await window.fetch(urlStr)
    if (!response.ok) throw new Error(`Error fetching ${urlStr}: ${response.statusText}`)
    const data = await response.text()
    const name = typeof _forceOrName === 'string' ? _forceOrName : undefined
    const force = _forceOrName === true || _force === true
    if (name !== undefined) injectCssRule(data.trim(), name, force)
    else injectCssRule(data.trim(), force)
    return data
  } catch (err) {
    if (err instanceof Error) return err
    return new Error('Unknown error')
  }
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
