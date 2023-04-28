export default function replaceAll (
  input: string,
  pattern: string|RegExp,
  replacer: string|((substring: string, ...args: any[]) => string),
  maxOps: number = 1000) {
  let output = input
  let opsCnt = 0
  while (output.match(pattern) && opsCnt < maxOps) {
    opsCnt ++
    if (typeof replacer === 'function') output = output.replace(pattern, replacer)
    else output = output.replace(pattern, replacer)
  }
  return output
}
