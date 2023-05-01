const alreadyGenerated: string[] = []

export default function fakeUuid (length = 8): string {
  if (length < 1) throw new Error('fake uuid length must be at least 1')
  const generatedArr = []
  generatedArr.push(genRandomAlphaChar())
  for (let i = 0; i < length - 1; i++) generatedArr.push(genRandomChar())
  const generated = generatedArr.join('')
  if (alreadyGenerated.includes(generated)) return fakeUuid(length)
  alreadyGenerated.push(generated)
  return generated
}

const genRandomChar = () => Math.floor(Math.random() * 36).toString(36)
const genRandomAlphaChar = (): string => {
  const generated = genRandomChar()
  if (generated.match(/[0-9]/igm)) return genRandomAlphaChar()
  return generated
}
