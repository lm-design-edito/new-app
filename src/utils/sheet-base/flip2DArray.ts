function flip2DArray (twoDArray: any[][]): any[][] {
  const flipped: any[][] = []
  twoDArray.forEach((line, linePos) => {
    line.forEach((cell, colPos) => {
      if (flipped[colPos] === undefined) flipped[colPos] = []
      flipped[colPos][linePos] = cell
    })
  })
  return flipped
}

export default flip2DArray
