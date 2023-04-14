const rulesMap: Map<string, string> = new Map()
const targetStyleElement = document.createElement('style')
const targetStyleElementIdentifier = 'lm-page-injected-styles'
targetStyleElement.classList.add(targetStyleElementIdentifier)
targetStyleElement.id = targetStyleElementIdentifier

// [WIP] possibility to give names to rules
function injectCssRule (rule: string, force?: boolean) {
  const rulesArr = Array.from(rulesMap.entries())
  const alreadyInMap: [string, string]|undefined = rulesArr.find(([_key, val]) => val === rule)
  const shouldInject = force === true || alreadyInMap === undefined
  if (!shouldInject) return alreadyInMap[0]
  const ruleKey = crypto.randomUUID()
  rulesMap.set(ruleKey, rule)
  updateStyleElement()
  return ruleKey
}

function updateStyleElement () {
  const rulesArr = Array.from(rulesMap.entries())
  targetStyleElement.innerHTML = rulesArr
    .map(([key, val]) => `/* ${key} */\n${val}`)
    .join('\n')
  const targetIsInDocument = document.getElementById(targetStyleElementIdentifier)
  if (!targetIsInDocument) document.head.append(targetStyleElement)
}

function removeCssRule (id: string) {
  const deleted = rulesMap.delete(id)
  if (deleted) updateStyleElement()
}

export default injectCssRule
export { injectCssRule, removeCssRule }
