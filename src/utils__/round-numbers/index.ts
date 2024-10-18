export default function roundNumbers (number: number, nbDecimals: number) {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.round(number * multiplier) / multiplier
}
