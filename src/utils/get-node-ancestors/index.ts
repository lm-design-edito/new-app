export default function getNodeAncestors (node: Node, traverseShadowRoots?: boolean) {
  const returned: Node[] = []
  let currentNode: Node | null = node
  while (currentNode !== null) {
    returned.push(currentNode)
    const parentNode = currentNode.parentNode as ParentNode | null
    const parentElement = currentNode.parentElement as HTMLElement | null
    const nextNode = parentNode instanceof ShadowRoot
      ? (traverseShadowRoots ? parentNode.host : parentElement)
      : parentElement
    currentNode = nextNode
  }
  return returned
}
