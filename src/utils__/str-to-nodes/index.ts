import sanitize, { Options as SanitizerOptions } from '~/utils/clientside-html-sanitizer'

type Options = { sanitize?: SanitizerOptions }

export default function strToNodes (dirtyStr: string, options?: Options): Node[] {
  const str = options?.sanitize !== undefined ? sanitize(dirtyStr, options.sanitize) : dirtyStr
  const wrapperDiv = document.createElement('div')
  wrapperDiv.innerHTML = str
  const nodes = [...wrapperDiv.childNodes].filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
