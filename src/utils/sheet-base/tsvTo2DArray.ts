function tsvTo2DArray (tsv: string): string[][] {
  return tsv
    .split('\n')
    .map(line => line.split('\t'))
}

export default tsvTo2DArray
