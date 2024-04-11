export default function toNodeList (...items: Node[]): NodeListOf<Node> {
  const fragment = document.createDocumentFragment()
  fragment.append(...items)
  return fragment.childNodes
}
