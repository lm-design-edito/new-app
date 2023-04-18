async function fetchTsv (url: string): Promise<string> {
  const response = await window.fetch(url)
  if (!response.ok) throw new Error()
  const tsvBase = await response.text()
  return tsvBase
}

export default fetchTsv
