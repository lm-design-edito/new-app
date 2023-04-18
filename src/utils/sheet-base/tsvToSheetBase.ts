import SheetBase from './SheetBase'
import tsvToEncodedTsv from './tsvToEncodedTsv'
import tsvTo2DArray from './tsvTo2DArray'
import encodedTsvArrayToTsvArray from './encodedTsvArrayToTsvArray'
import tsvArrayToCollectionsArray from './tsvArrayToCollectionsArray'
import flip2DArray from './flip2DArray'

function tsvToSheetBase (tsv: string): SheetBase {
  const encodedTsv = tsvToEncodedTsv(tsv)
  const encodedTsvArray = tsvTo2DArray(encodedTsv)
  const decodedTsvArray = encodedTsvArrayToTsvArray(encodedTsvArray)
  const collectionsArray = tsvArrayToCollectionsArray(decodedTsvArray)
  const sheetBase = new SheetBase()
  collectionsArray.forEach(collectionArray => {
    const { name, description } = collectionArray
    const collection = sheetBase.createCollection({ name, description })
    const flippedLines = flip2DArray(collectionArray.lines)
    const [namesLine, descriptionsLine, typesLine, ...entriesLines] = flippedLines
    entriesLines.forEach(entryLine => {
      const id = entryLine[0]
      if (id === '') return
      const entry = collection.createEntry({ id })
      entryLine.forEach((field, fieldPos) => {
        if (fieldPos === 0) return
        const name = namesLine[fieldPos]
        if (name === '') return
        const description = descriptionsLine[fieldPos]
        const type = typesLine[fieldPos]
        const raw = field
        entry.createField({ name, description, type, raw })
      })
    })
  })
  return sheetBase
}

export default tsvToSheetBase
