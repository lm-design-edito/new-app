type Filler = (pos?: number, arr?: any[]) => any

export default function arrayOf (filler: Filler, length: number) {
  return new Array(length).fill(null).map((_, pos, arr) => {
    return filler(pos, arr)
  })
}
