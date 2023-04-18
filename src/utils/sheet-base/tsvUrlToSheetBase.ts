import SheetBase from './SheetBase'
import fetchTsv from './fetchTsv'
import tsvToSheetBase from './tsvToSheetBase'

async function tsvUrlToSheetBase (url: string): Promise<SheetBase> {
  const tsvBase = await fetchTsv(url)
  const sheetBase = tsvToSheetBase(tsvBase)
  return sheetBase
}

export default tsvUrlToSheetBase
