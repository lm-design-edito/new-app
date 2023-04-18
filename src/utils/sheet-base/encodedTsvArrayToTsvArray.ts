import { toString } from '../charcode-string'

function encodedTsvArrayToTsvArray (encodedTsvArray: string[][]): string[][] {
  return encodedTsvArray.map(line => line.map(cell => {
    let returned = cell
    const tsvComplexCellOpeningTag = '<<<CELL>>>'
    const tsvComplexCellClosingTag = '<<</CELL>>>'
    const tsvComplexCellClosingTagEscaped = tsvComplexCellClosingTag.replace(/\//gm, '\\/')
    const tsvComplexCellRegex = new RegExp(`${tsvComplexCellOpeningTag}[\\S\\s]*?${tsvComplexCellClosingTagEscaped}`, 'gm')
    const tsvComplexCellDecoder = (match: string): string => {
      const inside = match
        .replace(tsvComplexCellOpeningTag, '')
        .replace(tsvComplexCellClosingTag, '')
      const { atob } = window
      const decInside = toString(atob(inside))
      return decInside
    }
    returned = returned.replace(tsvComplexCellRegex, tsvComplexCellDecoder)
    return returned
  }))
}

export default encodedTsvArrayToTsvArray
