export const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function randomHexChar () {
  const pos = Math.floor(Math.random() * hexChars.length)
  return hexChars[pos]
}

export default function randomUUID () {
  const group1 = new Array(8).fill(null).map(randomHexChar).join('')
  const group2 = new Array(4).fill(null).map(randomHexChar).join('')
  const group3 = new Array(4).fill(null).map(randomHexChar).join('')
  const group4 = new Array(4).fill(null).map(randomHexChar).join('')
  const group5 = new Array(12).fill(null).map(randomHexChar).join('')
  return `${group1}-${group2}-${group3}-${group4}-${group5}`
}
