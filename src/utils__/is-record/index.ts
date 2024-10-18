export default function isRecord (input: unknown): input is Record<string, unknown> {
  if (typeof input !== 'object' || input === null) return false
  return Object
    .keys(input)
    .every(key => typeof key === 'string')
}
