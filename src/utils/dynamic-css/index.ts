import randomUUID from '~/utils/random-uuid'
import selectorToElement from '../selector-to-element'

const rulesMap: Map<string, string> = new Map()
const targetStyleElement = document.createElement('style')
const targetStyleElementIdentifier = 'lm-page-injected-styles'
targetStyleElement.classList.add(targetStyleElementIdentifier)
targetStyleElement.id = targetStyleElementIdentifier

export function injectCssRule (rule: string, force?: boolean): string
export function injectCssRule (rule: string, name: string, force?: boolean): string
export function injectCssRule (rule: string, _forceOrName?: boolean|string, _force?: boolean): string {
  const name = typeof _forceOrName === 'string' ? _forceOrName : randomUUID()
  const force = _forceOrName === true || _force === true
  // [WIP] maybe check for name instead of rule value ?
  const alreadyInMap = rulesMap.get(name)
  const shouldInject = force === true || alreadyInMap === undefined
  if (!shouldInject) return name
  rulesMap.set(name, rule)
  updateStyleElements()
  return name
}

export function removeCssRule (id: string) {
  const deleted = rulesMap.delete(id)
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
  const styleTagsClass = 'lm-page-injected-styles'
  const allStylesTags = [...document.querySelectorAll(`.${styleTagsClass}`)]
  allStylesTags.forEach(styleTag => {
    const dataName = styleTag.getAttribute('data-name')
    if (dataName === null) return styleTag.remove()
    const matchingRule = rulesMap.get(dataName)
    if (matchingRule === undefined) return styleTag.remove()
  })
    
  // Update style tags
  rulesMap.forEach((rule, name) => {
    const existingTag = document.querySelector(`.${styleTagsClass}[data-name="${name}"]`)
    const targetCssValue = `/* ${name.replace(/\*\\/, '')} */\n${rule}`
    if (existingTag !== null) {
      existingTag.innerHTML = targetCssValue
    } else {
      const targetTag = document.createElement('style')
      targetTag.classList.add(styleTagsClass)
      targetTag.setAttribute('data-name', name)
      targetTag.innerHTML = targetCssValue
      document.head.append(targetTag)
    }
  })

  // const rulesArr = Array.from(rulesMap.entries())
  // rulesArr.forEach(([name, rule]) => {
  //   const existingTargetElement = document.querySelector(`.lm-page-injected-styles[data-name="${name}"]`)
    
  //   console.log(name)
  //   console.log(rule)
  //   console.log('-')
  // })


  // targetStyleElement.innerHTML = rulesArr
  //   .map(([key, val]) => `/* ${key.replace(/[^\w\-]+/igm, '')} */\n${val}`)
  //   .join('\n')
  // const targetIsInDocument = document.getElementById(targetStyleElementIdentifier)
  // if (!targetIsInDocument) document.head.append(targetStyleElement)
}
