export default function smoothScrollTo (element: Element) {
  const elementBoundingClientRect = element.getBoundingClientRect()
  const elementTop = elementBoundingClientRect.top
  window.scrollTo({
    top: elementTop,
    behavior: 'smooth'
  })
}
