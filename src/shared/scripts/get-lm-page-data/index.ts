type PageData = {}

// Find URLs in current page
export function getPageSheetbasesUrls () {
  return ['url1', 'url2']
}

export function getPageDocbasesUrls () {
  return ['url1', 'url2']
}

// Fetch data from URLs
export async function fetchSheet (url: string) {
  return 'some-tsv-string'
}

export async function fetchDoc (url: string) {
  return 'some-txt-string'
}

// Parse data
export function parseSheet (tsvData: string): PageData {
  if (Math.random() < .05) throw true
  return {} as PageData
}

export function parseDoc (txtData: string): PageData {
  if (Math.random() < .05) throw true
  return {} as PageData
}

// Merge parsed data
export function mergePagesDatum (...pagesDatum: PageData[]) {
  return {} as PageData
}

// Combine get, fetch, parse and merge
export default async function getFetchParseMerge () {
  const sheetbasesUrls = getPageSheetbasesUrls()
  const docbasesUrls = getPageDocbasesUrls()
  const sources: Array<{ url: string, type: 'sheet'|'doc' }> = [
    ...sheetbasesUrls.map(url => ({ url, type: 'sheet' as 'sheet' })),
    ...docbasesUrls.map(url => ({ url, type: 'doc' as 'doc' }))
  ]
  const pagesData: PageData[] = []
  // [WIP] Promise.all here
  for (const { url, type } of sources) {
    const fetch = type === 'sheet' ? fetchSheet : fetchDoc
    const parse = type === 'sheet' ? parseSheet : parseDoc
    // Fetch
    let raw
    try {
      raw = await fetch(url)
    } catch (err) {
      console.warn(err)
      continue
    }
    // Parse
    let parsed
    try {
      parsed = parse(raw)
    } catch (err) {
      console.warn(err)
      continue
    }
    // Aggregate parsed
    pagesData.push(parsed)
  }
  return mergePagesDatum(...pagesData)
}
