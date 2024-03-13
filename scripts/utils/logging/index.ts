import chalk from 'chalk'

export function makeTextBlock (text: string, vPadding: number = 1, hPadding: number = vPadding) {
  const lines = text.split('\n')
  const longestLine = Math.max(...lines.map(line => line.length))
  const textBlockArr = new Array(lines.length + 2 * vPadding)
    .fill(null)
    .map(() => new Array(longestLine + (hPadding * 2)).fill(' '))
  lines.forEach((line, linePos) => {
    const chars = line.split('')
    textBlockArr[linePos + vPadding]?.splice(hPadding, chars.length, ...chars)
  })
  return textBlockArr
  .map(lineArr => lineArr.join(''))
  .join('\n')
}

export const styles = {
  regular: (text: string) => text,
  light: (text: string) => chalk.grey(text),
  danger: (text: string) => chalk.bold.bgRed.whiteBright(makeTextBlock(`/!\\\n\n${text}\n`, 2, 6)),
  important: (text: string) => chalk.bold(text),
  title: (text: string) => `# ${chalk.bold.underline(`${text}\n`)}`,
  info: (text: string) => chalk.blueBright(text),
  error: (text: string) => chalk.bold.red(`Error: ${text}`),
  warning: (text: string) => chalk.bold.yellow(text)
}
