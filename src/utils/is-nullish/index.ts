const nullishValues = [null, undefined]

function isNullish (val: any): boolean {
  return nullishValues.includes(val)
}

export { nullishValues }
export default isNullish
