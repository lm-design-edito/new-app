export default function getNodeAncestors (node: Node) {
  const returned: Element[] = []
  let currentElement: Element | null = node.parentElement
  while (currentElement !== null) {
    returned.push(currentElement)
    const newCurrentElement = currentElement.parentElement
    currentElement = newCurrentElement
  }
  return returned
}
