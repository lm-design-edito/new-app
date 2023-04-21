// [WIP] maybe dont import this, pass as parameter instead
import { STYLES_INDEX_URL } from '../..'
import injectCssRule from '../../../../utils/dynamic-css'

export async function injectDefaultStyles () {
  try {
    const response = await window.fetch(STYLES_INDEX_URL)
    const data = await response.text()
    injectCssRule(data.trim())
    return data
  } catch (err) {
    if (err instanceof Error) return err
    return new Error('Unknown error')
  }
}
