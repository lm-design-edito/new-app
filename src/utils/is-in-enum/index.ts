export default function isInEnum<E extends Record<string, string | number>> (
  enumObj: E,
  value: string | number
): value is E[keyof E] {
  const keys = Object.keys(enumObj)
  const values = Object.values(enumObj)
  const numericValues = values.filter(val => typeof val === 'number')
  const cleanKeys = keys.filter(key => !numericValues.includes(parseInt(key, 10)))
  const cleanValues = cleanKeys.map(cleanKey => enumObj[cleanKey])
  return cleanValues.includes(value)
}
