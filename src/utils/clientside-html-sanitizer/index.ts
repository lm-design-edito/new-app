export type AttributeNameValPair = {
  attributeName: string|RegExp
  attributeValues?: Array<string|RegExp>
}

export type Options = {
  inputFreeTransform?: (input: string) => string
  keepComments?: boolean
  allowedTags?: string[]
  forbiddenTags?: string[]
  allowedAttributes?: { [tagName: string]: AttributeNameValPair[] }
  forbiddenAttributes?: { [tagName: string]: AttributeNameValPair[] }
  depth?: number
  verbose?: boolean
}

export const defaultOptions: Options = { depth: 20 }

export default function sanitize (
  inputStr: string,
  options: Options = defaultOptions): string {
  const wrapperDiv = document.createElement('div')
  const { inputFreeTransform } = options
  wrapperDiv.innerHTML = inputFreeTransform !== undefined ? inputFreeTransform(inputStr) : inputStr
  const sanitizedWrapper = sanitizeElement(wrapperDiv, options)
  const returned = sanitizedWrapper?.innerHTML
  return returned ?? ''
}

export function sanitizeElement (
  element: Element,
  options: Options = defaultOptions): Element|null {
  const { tagName, attributes, childNodes } = element
  const {
    allowedTags = [],
    allowedAttributes = {},
    forbiddenTags = [],
    forbiddenAttributes = {},
    depth = 20,
    verbose = false
  } = options
  if (depth <= 0) {
    console.warn('Max depth reached')
    return null
  }
  
  // Element's tag name checkup
  const normalizedTagName = tagName.toLowerCase().trim()
  const tagIsInForbidden = forbiddenTags.includes('*') || forbiddenTags.includes(normalizedTagName)
  if (tagIsInForbidden) {
    if (verbose === true) console.warn(tagName, 'tag is forbidden')
    return null
  }
  const tagIsInAllowed = allowedTags.includes('*') || allowedTags.includes(normalizedTagName)  
  if (!tagIsInAllowed) {
    if (verbose === true) console.warn(tagName, 'tag is not allowed')
    return null
  }
  const returnedElement = document.createElement(tagName)
  
  // Element's attributes checkup
  const returnedAttributes = [...attributes].filter(({ name: attributeName, value: attributeValue }) => {
    const allTagsForbiddenAttributes = forbiddenAttributes['*'] ?? [] as AttributeNameValPair[]
    const thisTagForbiddenAttributes = forbiddenAttributes[normalizedTagName] ?? [] as AttributeNameValPair[]
    const mergedForbiddenAttributes: AttributeNameValPair[] = [...allTagsForbiddenAttributes, ...thisTagForbiddenAttributes]
    const isInForbidden = mergedForbiddenAttributes.some(({
      attributeName: nameTester,
      attributeValues: valTesters }) => {
      if (typeof nameTester === 'string' && nameTester !== '*' && attributeName !== nameTester) return false // attribute name doesnt match
      if (typeof nameTester !== 'string' && !nameTester.test(attributeName)) return false // attribute name doesnt match
      if (valTesters === undefined) {
        if (verbose === true) console.warn(attributeName, 'attribute on', tagName, 'tag is forbidden')
        return true // attribute name matches, and all values are forbidden
      }
      if (valTesters.includes('*')) {
        if (verbose === true) console.warn(attributeName, 'attribute on', tagName, 'tag is forbidden')
        return true // attribute name matches, and all values are EXPLICITLY forbidden
      }
      return valTesters.some(valTester => {
        if (typeof valTester === 'string' && attributeValue === valTester) {
          if (verbose === true) console.warn(attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is forbidden. Rule:', valTester)
          return true // attribute value strictly matches
        }
        if (typeof valTester !== 'string' && valTester.test(attributeValue)) {
          if (verbose === true) console.warn(attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is forbidden. Rule:', valTester)
          return true // attribute value partially matches
        }
        return false
      })
    })
    if (isInForbidden) return false
    const allTagsAllowedAttributes = allowedAttributes['*'] ?? [] as AttributeNameValPair[]
    const thisTagAllowedAttributes = allowedAttributes[normalizedTagName] ?? [] as AttributeNameValPair[]
    const mergedAllowedAttributes: AttributeNameValPair[] = [...allTagsAllowedAttributes, ...thisTagAllowedAttributes]
    let latestNotAllowedReason: string[] = [tagName, 'has no allowed attributes']
    const isInAllowed = mergedAllowedAttributes.some(({
      attributeName: nameTester,
      attributeValues: valTesters }) => {
      if (typeof nameTester === 'string' && nameTester !== '*' && attributeName !== nameTester) {
        latestNotAllowedReason = [attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false // attribute name doesnt match
      }
      if (typeof nameTester !== 'string' && !nameTester.test(attributeName)) {
        latestNotAllowedReason = [attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false // attribute name doesnt match
      }
      if (valTesters === undefined) return true // attribute name matches, and all values are allowed
      if (valTesters.includes('*')) return true // attribute name matches, and all values are EXPLICITLY allowed
      return valTesters.some(valTester => {
        if (typeof valTester === 'string' && attributeValue === valTester) return true // attribute value strictly matches
        if (typeof valTester !== 'string' && valTester.test(attributeValue)) return true // attribute value partially matches
        latestNotAllowedReason = [attributeValue, 'value for', attributeName, 'attribute on', tagName, 'tag is not allowed']
        return false
      })
    })
    if (!isInAllowed) {
      if (verbose === true) console.warn(...latestNotAllowedReason)
      return false
    }
    return true
  })
  
  returnedAttributes.forEach(({ name, value }) => {
    returnedElement.setAttribute(name, value)
  })
  // Element's children sanitization
  const sanitizedChildNodes = [...childNodes]
    .map((node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return sanitizeElement(node as Element, { ...options, depth: depth - 1 })
      else if (node.nodeType === Node.TEXT_NODE) return node
      else if (options.keepComments === true && node.nodeType === Node.COMMENT_NODE) return node
      return null
    })
    .filter((elt): elt is Node => elt !== null)

  returnedElement.replaceChildren(...sanitizedChildNodes)
  return returnedElement
}
