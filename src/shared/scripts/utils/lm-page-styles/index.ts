import injectCssRule from '~/utils/dynamic-css'

export async function injectDefaultStyles (url: string|URL) {
  try {
    const response = await window.fetch(url)
    const data = await response.text()
    injectCssRule(data.trim())
    return data
  } catch (err) {
    if (err instanceof Error) return err
    return new Error('Unknown error')
  }
}
