export function getHeaderInVisuelInteractifTemplate () {
  const header = document.querySelector('header.multimediaNav')
  return header !== null ? [header] : null
}

export function getHeaderInVideoTemplate () {
  const header = document.querySelector('div#Header.old__header')
  const nav = document.querySelector('div.Header__nav-container')
  const returned = []
  if (header !== null) returned.push(header)
  if (nav !== null) returned.push(nav)
  if (returned.length === 0) return null
  return returned
}

export function getHeaderInLiveTemplate () {
  return getHeaderInVideoTemplate()
}

export function getHeaderInPortfolioTemplate () {
  return getHeaderInVideoTemplate()
}

export function getHeaderInArticleTemplate () {
  return getHeaderInVideoTemplate()
}

export function getHeaderInLargeArticleTemplate () {
  return getHeaderInVideoTemplate()
}

export default function getHeaderElements () {
  const fromVisuelInteractif = getHeaderInVisuelInteractifTemplate()
  const fromOtherTemplates = getHeaderInVideoTemplate() // no need to call all the functions since they are all the same
  const returned = []
  if (fromVisuelInteractif !== null) returned.push(...fromVisuelInteractif)
  if (fromOtherTemplates !== null) returned.push(...fromOtherTemplates)
  if (returned.length === 0) return null
  return returned
}
