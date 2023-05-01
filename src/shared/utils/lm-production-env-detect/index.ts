const regexp = /^https:\/\/([a-zA-Z0-9]+\.)?lemonde\.fr$/

export default function isProduction () {
  const { origin } = window.location
  return origin.match(regexp) !== null
}
