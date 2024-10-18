export default function arrayRandomPick (arr: any[], exclude: any[] = []): any {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  const pos = Math.floor(Math.random() * length)
  return filteredArr[pos]
}
