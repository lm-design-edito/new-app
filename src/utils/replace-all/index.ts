export default function replaceAll (
  input: string,
  pattern: string | RegExp,
  replacer: string | ((substring: string, ...args: any[]) => string)) {
  const regexPattern = typeof pattern !== 'string'
    ? new RegExp(pattern.source, `${pattern.flags}g`)
    : new RegExp(pattern
      .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      .replace(/-/g, '\\x2d'),
      'g')
  if (typeof replacer === 'function') return input.replace(regexPattern, replacer)
  return input.replace(regexPattern, replacer)
}

