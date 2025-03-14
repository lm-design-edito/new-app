export function getNeighbourIntegersSeries (_array: number[] | Set<number>): number[][] {
  const result: number[][] = []
  const dedupedIntArray = [...new Set(_array)].filter(num => Number.isInteger(num))
  dedupedIntArray.forEach(num => {
    const numHasAlreadyASeries = result.some(series => series.includes(num))
    if (numHasAlreadyASeries) return
    const numSeries = getIntNeighboursInNumbersSet(num, dedupedIntArray)
    result.push(numSeries)
  })
  return result
}

export function getIntNeighboursInNumbersSet (
  integer: number,
  _array: number[] | Set<number>
): number[] {
  const dedupedIntArray = [...new Set(_array)].filter(num => Number.isInteger(num))
  if (!dedupedIntArray.includes(integer)) return []
  const result = [integer]
  const lower = dedupedIntArray.filter(num => num < integer).sort((a, b) => b - a)
  const higher = dedupedIntArray.filter(num => num > integer).sort((a, b) => a - b)
  lower.forEach(num => {
    const firstPos = result[0]
    if (firstPos === undefined) return
    if (firstPos - num === 1) result.unshift(num)
  })
  higher.forEach(num => {
    const lastPos = result[result.length - 1] as number | undefined
    if (lastPos === undefined) return
    if (num - lastPos === 1) result.push(num)
  })
  return result
}
