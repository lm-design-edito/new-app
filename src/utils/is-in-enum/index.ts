export default function isInEnum<E extends Object> (
  enumObj: E,
  value: unknown
): value is E[keyof E] {
  return Object
    .values(enumObj)
    .includes(value)
}
