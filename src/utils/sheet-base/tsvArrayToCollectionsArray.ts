interface CollectionArray {
  name: string
  description: string
  lines: string[][]
}

function tsvArrayToCollectionsArray (decodedTsvArray: string[][]): CollectionArray[] {
  const collections: CollectionArray[] = []
  decodedTsvArray.forEach(line => {
    const [key, name, type] = line
    if (type === 'id') {
      collections.push({
        name: key,
        description: name,
        lines: [line]
      })
    } else if (collections.length !== 0) {
      const currentCollection = collections.slice(-1)[0]
      currentCollection.lines.push(line)
    }
  })
  return collections
}

export type { CollectionArray }
export default tsvArrayToCollectionsArray
