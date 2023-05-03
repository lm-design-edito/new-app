import randomUUID from '~/utils/random-UUID'

const rulesMap: Map<string, string> = new Map()
const targetStyleElement = document.createElement('style')
const targetStyleElementIdentifier = 'lm-page-injected-styles'
targetStyleElement.classList.add(targetStyleElementIdentifier)
targetStyleElement.id = targetStyleElementIdentifier

export function injectCssRule (rule: string, force?: boolean): string
export function injectCssRule (rule: string, name: string, force?: boolean): string
export function injectCssRule (rule: string, _forceOrName?: boolean|string, _force?: boolean): string {
  const name = typeof _forceOrName === 'string' ? _forceOrName : undefined
  const force = _forceOrName === true || _force === true
  const rulesArr = Array.from(rulesMap.entries())
  // [WIP] maybe check for name instead of rule value ?
  const alreadyInMap: [string, string]|undefined = rulesArr.find(([_key, val]) => val === rule)
  const shouldInject = force === true || alreadyInMap === undefined
  if (!shouldInject) return alreadyInMap[0]
  const ruleKey = name ?? randomUUID()
  rulesMap.set(ruleKey, rule)
  updateStyleElement()
  return ruleKey
}

export function removeCssRule (id: string) {
  const deleted = rulesMap.delete(id)
  if (deleted) updateStyleElement()
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

function updateStyleElement () {
  const rulesArr = Array.from(rulesMap.entries())
  targetStyleElement.innerHTML = rulesArr
    .map(([key, val]) => `/* ${key} */\n${val}`)
    .join('\n')
  const targetIsInDocument = document.getElementById(targetStyleElementIdentifier)
  if (!targetIsInDocument) document.head.append(targetStyleElement)
}
