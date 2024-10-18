export default function stringNormalizeIndent (input: string, indentLevel: number = 0) {
  const indent = (' ').repeat(indentLevel)
  const lines = input.split('\n')
  const noIndentLines = lines.map(line => line.replace(/^\s*/igm, ''))
  const pipeReplacedLines = noIndentLines.map(line => {
    const nbPipeCharsOnLineStart = line.match(/^\|+/igm)?.[0].length ?? 0
    const noPipeLine = line.slice(nbPipeCharsOnLineStart)
    const replacedPipes = (' ').repeat(nbPipeCharsOnLineStart)
    return replacedPipes + noPipeLine
  })
  const normalizedLines = pipeReplacedLines.map(line => indent + line)
  return normalizedLines.join('\n')
}
